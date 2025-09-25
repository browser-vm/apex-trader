import type {
  StockQuote,
  StockDataPoint,
  TwelveDataSearchResult,
  TwelveDataQuote,
  TwelveDataTimeSeries,
} from '@shared/types';
import { toast } from 'sonner';
// IMPORTANT: Replace with your own Twelve Data API key.
// Sign up at https://twelvedata.com/register
const API_KEY = 'f8ef7e577e174ffe9b22a23fd0aed9f4';
const BASE_URL = 'https://api.twelvedata.com';
const apiFetch = async <T>(params: URLSearchParams): Promise<T | null> => {
  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'error') {
      console.warn('Twelve Data API error:', data.message);
      toast.warning(data.message || "API error occurred.");
      return null;
    }
    return data as T;
  } catch (error) {
    console.error('Twelve Data API fetch error:', error);
    toast.error("Failed to fetch live stock data.");
    return null;
  }
};
export const searchStocks = async (query: string): Promise<StockQuote[]> => {
  if (!query) return [];
  const params = new URLSearchParams({
    symbol: query,
    apikey: API_KEY,
  });
  const data = await apiFetch<TwelveDataSearchResult[]>(params);
  if (!data) return [];
  return data.map(match => ({
    symbol: match.symbol,
    companyName: match.name,
    price: 0, // Search doesn't provide price
    change: 0,
    changePercent: 0,
    previousClose: 0,
  }));
};
export const getQuote = async (symbol: string): Promise<StockQuote | null> => {
  const params = new URLSearchParams({
    symbol: symbol,
    apikey: API_KEY,
  });
  const data = await apiFetch<TwelveDataQuote>(params);
  if (!data) return null;
  return {
    symbol: data.symbol,
    companyName: data.name,
    price: parseFloat(data.close),
    change: parseFloat(data.change),
    changePercent: parseFloat(data.percent_change.replace('%', '')) / 100,
    previousClose: parseFloat(data.previous_close),
  };
};
const parseTimeSeries = (timeSeries: TwelveDataTimeSeries): StockDataPoint[] => {
  return timeSeries.map(item => ({
    date: item.datetime.split(' ')[0], // Assuming datetime is 'YYYY-MM-DD HH:MM:SS', take date part
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseInt(item.volume, 10),
  }));
  // Twelve Data returns oldest first, no need to reverse
};
export const getDailyHistory = async (symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<StockDataPoint[]> => {
    const params = new URLSearchParams({
        symbol: symbol,
        interval: '1day',
        outputsize: outputSize === 'full' ? '5000' : '100',
        apikey: API_KEY,
    });
    const data = await apiFetch<TwelveDataTimeSeries>(params);
    return data ? parseTimeSeries(data) : [];
};
export const getIntradayHistory = async (symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<StockDataPoint[]> => {
    const params = new URLSearchParams({
        symbol: symbol,
        interval: interval,
        outputsize: '5000',
        apikey: API_KEY,
    });
    const data = await apiFetch<TwelveDataTimeSeries>(params);
    return data ? parseTimeSeries(data) : [];
};