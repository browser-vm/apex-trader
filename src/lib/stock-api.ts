import type {
  StockQuote,
  StockDataPoint,
  AlphaVantageSearchResult,
  AlphaVantageQuote,
  AlphaVantageTimeSeries,
  NewsArticle,
  AlphaVantageNewsItem,
} from '@shared/types';
import { toast } from 'sonner';
// IMPORTANT: Replace with your own Alpha Vantage API key.
// The free key has limitations (e.g., 25 requests per day).
const API_KEY = 'DEMO';
const BASE_URL = 'https://www.alphavantage.co/query';
const MOCK_COMPANY_NAMES: Record<string, string> = {
    'SPY': 'SPDR S&P 500 ETF Trust',
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'TSLA': 'Tesla, Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'MSFT': 'Microsoft Corporation',
    'NVDA': 'NVIDIA Corporation',
};
const apiFetch = async <T>(params: URLSearchParams): Promise<T | null> => {
  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data['Note'] || data['Information']) {
      console.warn('Alpha Vantage API limit likely reached:', data);
      toast.warning("API limit reached. Using fallback data or try again later.");
      return null;
    }
    if (data['Error Message']) {
        throw new Error(data['Error Message']);
    }
    return data as T;
  } catch (error) {
    console.error('Alpha Vantage API fetch error:', error);
    toast.error("Failed to fetch live stock data.");
    return null;
  }
};
export const searchStocks = async (query: string): Promise<StockQuote[]> => {
  if (!query) return [];
  const params = new URLSearchParams({
    function: 'SYMBOL_SEARCH',
    keywords: query,
    apikey: API_KEY,
  });
  const data = await apiFetch<{ bestMatches: AlphaVantageSearchResult[] }>(params);
  if (!data || !data.bestMatches) return [];
  return data.bestMatches.map(match => ({
    symbol: match['1. symbol'],
    companyName: match['2. name'],
    price: 0, // Search doesn't provide price
    change: 0,
    changePercent: 0,
    previousClose: 0,
  }));
};
export const getQuote = async (symbol: string): Promise<StockQuote | null> => {
  const params = new URLSearchParams({
    function: 'GLOBAL_QUOTE',
    symbol: symbol,
    apikey: API_KEY,
  });
  const data = await apiFetch<AlphaVantageQuote>(params);
  const quote = data?.['Global Quote'];
  if (!quote || Object.keys(quote).length === 0) return null;
  return {
    symbol: quote['01. symbol'],
    companyName: MOCK_COMPANY_NAMES[quote['01. symbol']] || quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')) / 100,
    previousClose: parseFloat(quote['08. previous close']),
  };
};
const parseTimeSeries = (timeSeries: AlphaVantageTimeSeries): StockDataPoint[] => {
  return Object.entries(timeSeries)
    .map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'], 10),
    }))
    .reverse(); // API returns newest first, we need oldest first for charting
};
export const getDailyHistory = async (symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<StockDataPoint[]> => {
    const params = new URLSearchParams({
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol: symbol,
        outputsize: outputSize,
        apikey: API_KEY,
    });
    const data = await apiFetch<{ 'Time Series (Daily)': AlphaVantageTimeSeries }>(params);
    const timeSeries = data?.['Time Series (Daily)'];
    return timeSeries ? parseTimeSeries(timeSeries) : [];
};
export const getIntradayHistory = async (symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<StockDataPoint[]> => {
    const params = new URLSearchParams({
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: interval,
        apikey: API_KEY,
    });
    const data = await apiFetch<{ [key: string]: AlphaVantageTimeSeries }>(params);
    const key = `Time Series (${interval})`;
    const timeSeries = data?.[key];
    return timeSeries ? parseTimeSeries(timeSeries) : [];
};
export const getNews = async (symbol: string): Promise<NewsArticle[]> => {
    const params = new URLSearchParams({
        function: 'NEWS_SENTIMENT',
        tickers: symbol,
        limit: '20', // Fetch 20 articles
        apikey: API_KEY,
    });
    const data = await apiFetch<{ feed: AlphaVantageNewsItem[] }>(params);
    if (!data || !data.feed) return [];
    // Map to our simpler NewsArticle type
    return data.feed.map(item => ({
        title: item.title,
        url: item.url,
        time_published: item.time_published,
        summary: item.summary,
        banner_image: item.banner_image,
        source: item.source,
    }));
};