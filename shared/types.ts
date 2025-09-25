export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// DEMO TYPES - Can be removed
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
// APEX TRADER TYPES
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
}
export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
}
export interface Trade {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
  orderType: OrderType;
  limitPrice?: number;
  stopPrice?: number;
  timestamp: number;
}
export interface Portfolio {
  id: string;
  cash: number;
  positions: Position[];
  tradeHistory: Trade[];
  achievements: string[];
}
export interface PortfolioHistoryPoint {
    date: string;
    value: number;
    benchmarkValue: number;
    initialPortfolioValue: number;
    initialBenchmarkValue: number;
}
// GAMIFICATION TYPES
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}
export interface LeaderboardEntry {
  userId: string;
  username: string;
  portfolioValue: number;
  rank: number;
}
// NEWS TYPES
export interface NewsArticle {
    title: string;
    url: string;
    time_published: string;
    summary: string;
    banner_image: string;
    source: string;
}
// ALPHA VANTAGE API TYPES
export interface AlphaVantageSearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}
export interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}
export interface AlphaVantageTimeSeries {
  [date: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  };
}
export interface AlphaVantageNewsItem {
    title: string;
    url: string;
    time_published: string;
    authors: string[];
    summary: string;
    banner_image: string;
    source: string;
    category_within_source: string;
    source_domain: string;
    topics: { topic: string; relevance_score: string }[];
    overall_sentiment_score: number;
    overall_sentiment_label: string;
    ticker_sentiment: {
        ticker: string;
        relevance_score: string;
        ticker_sentiment_score: string;
        ticker_sentiment_label: string;
    }[];
}