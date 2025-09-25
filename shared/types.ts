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
// TWELVE DATA API TYPES
export interface TwelveDataSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  type: string;
}
export interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
}
export interface TwelveDataTimeSeriesItem {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}
export type TwelveDataTimeSeries = TwelveDataTimeSeriesItem[];