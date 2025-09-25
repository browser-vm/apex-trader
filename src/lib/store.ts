import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Portfolio, StockDataPoint, StockQuote, Trade, OrderType, PortfolioHistoryPoint, LeaderboardEntry, Achievement } from '@shared/types';
import { getDailyHistory, getIntradayHistory, getQuote } from './stock-api';
import { api } from './api-client';
import { toast } from 'sonner';
import { produce } from 'immer';
import { ALL_ACHIEVEMENTS, checkAchievements } from './achievements';
export type TimeRange = '1D' | '5D' | '1M' | '6M' | '1Y';
const TRANSACTION_FEE = 1.00; // $1.00 commission per trade
interface AppState {
  portfolio: Portfolio | null;
  watchlist: string[];
  // Active Stock State
  activeSymbol: string;
  activeQuote: StockQuote | null;
  activePriceHistory: StockDataPoint[];
  activeTimeRange: TimeRange;
  // Analytics State
  portfolioHistory: PortfolioHistoryPoint[];
  benchmarkHistory: StockDataPoint[];
  // Gamification State
  leaderboardData: LeaderboardEntry[];
  achievements: Achievement[];
  // UI State
  isPortfolioLoading: boolean;
  isQuoteLoading: boolean;
  isHistoryLoading: boolean;
  isSubmittingOrder: boolean;
  isLeaderboardLoading: boolean;
}
interface AppActions {
  init: () => Promise<void>;
  setActiveSymbol: (symbol: string) => Promise<void>;
  setActiveTimeRange: (timeRange: TimeRange) => Promise<void>;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  executeTrade: (tradeDetails: Omit<Trade, 'id' | 'timestamp' | 'price'>) => Promise<void>;
  fetchAnalyticsData: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  resetPortfolio: () => Promise<void>;
}
export const useStore = create<AppState & AppActions>()(
  immer((set, get) => ({
    portfolio: null,
    watchlist: ['AAPL', 'TSLA', 'NVDA'],
    activeSymbol: 'SPY',
    activeQuote: null,
    activePriceHistory: [],
    activeTimeRange: '1Y',
    portfolioHistory: [],
    benchmarkHistory: [],
    leaderboardData: [],
    achievements: ALL_ACHIEVEMENTS,
    isPortfolioLoading: true,
    isQuoteLoading: true,
    isHistoryLoading: true,
    isSubmittingOrder: false,
    isLeaderboardLoading: false,
    init: async () => {
      try {
        set({ isPortfolioLoading: true });
        const portfolio = await api<Portfolio>('/api/portfolio');
        set({ portfolio, isPortfolioLoading: false });
        await get().setActiveSymbol(get().activeSymbol);
      } catch (error) {
        console.error("Failed to initialize portfolio", error);
        toast.error("Failed to load portfolio data.");
        set({ isPortfolioLoading: false });
      }
    },
    setActiveSymbol: async (symbol) => {
      set({ activeSymbol: symbol, isQuoteLoading: true, activeQuote: null });
      try {
        const quote = await getQuote(symbol);
        set({ activeQuote: quote, isQuoteLoading: false });
        await get().setActiveTimeRange(get().activeTimeRange);
      } catch (error) {
        console.error(`Failed to fetch quote for ${symbol}`, error);
        toast.error(`Failed to load quote for ${symbol}.`);
        set({ isQuoteLoading: false });
      }
    },
    setActiveTimeRange: async (timeRange) => {
      set({ activeTimeRange: timeRange, isHistoryLoading: true, activePriceHistory: [] });
      const symbol = get().activeSymbol;
      try {
        let history: StockDataPoint[] = [];
        switch (timeRange) {
          case '1D': history = await getIntradayHistory(symbol, '5min'); break;
          case '5D': history = await getIntradayHistory(symbol, '30min'); break;
          default: history = await getDailyHistory(symbol, 'full'); break;
        }
        const filterHistoryByRange = (data: StockDataPoint[], range: TimeRange): StockDataPoint[] => {
            const now = new Date();
            const filterDate = new Date(now);
            if (range === '1D') return data;
            switch(range) {
                case '5D': filterDate.setDate(now.getDate() - 5); break;
                case '1M': filterDate.setMonth(now.getMonth() - 1); break;
                case '6M': filterDate.setMonth(now.getMonth() - 6); break;
                case '1Y': filterDate.setFullYear(now.getFullYear() - 1); break;
            }
            return data.filter(d => new Date(d.date) >= filterDate);
        }
        set({ activePriceHistory: filterHistoryByRange(history, timeRange), isHistoryLoading: false });
      } catch (error) {
        console.error(`Failed to fetch history for ${symbol}`, error);
        toast.error(`Failed to load price history for ${symbol}.`);
        set({ isHistoryLoading: false });
      }
    },
    addToWatchlist: (symbol) => set((state) => {
      if (!state.watchlist.includes(symbol)) {
        state.watchlist.push(symbol);
      }
    }),
    removeFromWatchlist: (symbol) => set((state) => {
      state.watchlist = state.watchlist.filter((s) => s !== symbol);
    }),
    executeTrade: async (tradeDetails) => {
      set({ isSubmittingOrder: true });
      const { symbol, quantity, type, orderType, limitPrice, stopPrice } = tradeDetails;
      const liveQuote = await getQuote(symbol);
      if (!liveQuote) {
        toast.error("Could not fetch latest price. Trade cancelled.");
        set({ isSubmittingOrder: false });
        return;
      }
      const price = liveQuote.price;
      const cost = quantity * price;
      const currentPortfolio = get().portfolio;
      if (!currentPortfolio) {
        toast.error("Portfolio not loaded.");
        set({ isSubmittingOrder: false });
        return;
      }
      let nextPortfolio;
      try {
        nextPortfolio = produce(currentPortfolio, draft => {
          if (type === 'BUY') {
            if (draft.cash < cost + TRANSACTION_FEE) {
              toast.error("Not enough cash for purchase and commission.");
              throw new Error("Insufficient funds");
            }
            draft.cash -= (cost + TRANSACTION_FEE);
            const existingPosition = draft.positions.find(p => p.symbol === symbol);
            if (existingPosition) {
              const totalCost = existingPosition.averagePrice * existingPosition.quantity + cost;
              existingPosition.quantity += quantity;
              existingPosition.averagePrice = totalCost / existingPosition.quantity;
            } else {
              draft.positions.push({ symbol, quantity, averagePrice: price });
            }
          } else { // SELL
            const positionToSell = draft.positions.find(p => p.symbol === symbol);
            if (!positionToSell || positionToSell.quantity < quantity) {
              toast.error("Not enough shares to sell.");
              throw new Error("Insufficient shares");
            }
            if (draft.cash + cost < TRANSACTION_FEE) {
                toast.error("Not enough proceeds to cover commission.");
                throw new Error("Insufficient proceeds for fee");
            }
            draft.cash += (cost - TRANSACTION_FEE);
            positionToSell.quantity -= quantity;
            if (positionToSell.quantity === 0) {
              draft.positions = draft.positions.filter(p => p.symbol !== symbol);
            }
          }
          const newTrade: Trade = {
            id: crypto.randomUUID(),
            symbol, quantity, price, type, orderType, limitPrice, stopPrice,
            timestamp: Date.now(),
          };
          draft.tradeHistory.push(newTrade);
          // Achievement Check
          const newAchievements = checkAchievements(draft);
          if (newAchievements.length > 0) {
            draft.achievements.push(...newAchievements);
            newAchievements.forEach(achId => {
              const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achId);
              if (achievement) {
                toast.success(`🏆 Achievement Unlocked: ${achievement.name}`);
              }
            });
          }
        });
      } catch (error) {
        // This catches errors from within the produce block, like insufficient funds.
        set({ isSubmittingOrder: false });
        return;
      }
      set({ portfolio: nextPortfolio }); // Optimistic update
      toast.success(`${type === 'BUY' ? 'Bought' : 'Sold'} ${quantity} ${symbol} @ ${price.toFixed(2)} (Fee: $${TRANSACTION_FEE.toFixed(2)})`);
      try {
        const updatedPortfolio = await api<Portfolio>('/api/portfolio', {
          method: 'POST',
          body: JSON.stringify(nextPortfolio),
        });
        set({ portfolio: updatedPortfolio }); // Sync with server response
        get().fetchLeaderboard(); // Refresh leaderboard after trade
      } catch (error) {
        console.error("Failed to save portfolio", error);
        toast.error("Failed to sync trade with server. Reverting.");
        set({ portfolio: currentPortfolio }); // Revert on failure
      } finally {
        set({ isSubmittingOrder: false });
      }
    },
    fetchAnalyticsData: async () => {
        set({ isHistoryLoading: true });
        const portfolio = get().portfolio;
        if (!portfolio || portfolio.tradeHistory.length === 0) {
            set({ isHistoryLoading: false, portfolioHistory: [] });
            return;
        }
        try {
            const benchmarkData = await getDailyHistory('SPY', 'full');
            set({ benchmarkHistory: benchmarkData });
            const allSymbols = [...new Set(portfolio.tradeHistory.map(t => t.symbol))];
            const priceDataPromises = allSymbols.map(symbol => getDailyHistory(symbol, 'full').then(data => ({ symbol, data })));
            const priceDataResults = await Promise.all(priceDataPromises);
            const priceDataMap = new Map(priceDataResults.map(p => [p.symbol, new Map(p.data.map(d => [d.date, d.close]))]));
            const history: PortfolioHistoryPoint[] = [];
            const benchmarkMap = new Map(benchmarkData.map(d => [d.date, d.close]));
            const firstTradeDate = new Date(portfolio.tradeHistory[0].timestamp).toISOString().split('T')[0];
            const relevantBenchmarkData = benchmarkData.filter(d => d.date >= firstTradeDate);
            if(relevantBenchmarkData.length === 0) {
                set({ isHistoryLoading: false, portfolioHistory: [] });
                return;
            }
            const initialPortfolioValue = 100000;
            const initialBenchmarkValue = relevantBenchmarkData[0].close;
            for (const day of relevantBenchmarkData) {
                let cash = 100000;
                const positions: { [symbol: string]: { quantity: number, avgPrice: number } } = {};
                const tradesUpToDay = portfolio.tradeHistory.filter(t => new Date(t.timestamp).toISOString().split('T')[0] <= day.date);
                for (const trade of tradesUpToDay) {
                    if (trade.type === 'BUY') {
                        cash -= (trade.quantity * trade.price) + TRANSACTION_FEE;
                        const pos = positions[trade.symbol] || { quantity: 0, avgPrice: 0 };
                        const newTotalCost = (pos.avgPrice * pos.quantity) + (trade.price * trade.quantity);
                        pos.quantity += trade.quantity;
                        pos.avgPrice = newTotalCost / pos.quantity;
                        positions[trade.symbol] = pos;
                    } else {
                        cash += (trade.quantity * trade.price) - TRANSACTION_FEE;
                        if (positions[trade.symbol]) {
                            positions[trade.symbol].quantity -= trade.quantity;
                        }
                    }
                }
                let holdingsValue = 0;
                for (const symbol in positions) {
                    const priceOnDay = priceDataMap.get(symbol)?.get(day.date) || 0;
                    holdingsValue += positions[symbol].quantity * priceOnDay;
                }
                history.push({
                    date: day.date,
                    value: cash + holdingsValue,
                    benchmarkValue: benchmarkMap.get(day.date) || 0,
                    initialPortfolioValue,
                    initialBenchmarkValue
                });
            }
            const normalizedHistory = history.map(h => ({
                ...h,
                benchmarkValue: (h.benchmarkValue / initialBenchmarkValue) * initialPortfolioValue
            }));
            set({ portfolioHistory: normalizedHistory, isHistoryLoading: false });
        } catch (error) {
            console.error("Failed to fetch analytics data", error);
            toast.error("Could not load performance analytics.");
            set({ isHistoryLoading: false });
        }
    },
    fetchLeaderboard: async () => {
      set({ isLeaderboardLoading: true });
      try {
        const data = await api<LeaderboardEntry[]>('/api/leaderboard');
        set({ leaderboardData: data, isLeaderboardLoading: false });
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
        toast.error("Could not load leaderboard.");
        set({ isLeaderboardLoading: false });
      }
    },
    resetPortfolio: async () => {
      try {
        const resetPortfolio = await api<Portfolio>('/api/portfolio/reset', { method: 'POST' });
        set({
          portfolio: resetPortfolio,
          portfolioHistory: [],
          benchmarkHistory: [],
        });
        toast.success("Portfolio has been reset.");
        get().fetchLeaderboard();
      } catch (error) {
        console.error("Failed to reset portfolio", error);
        toast.error("An error occurred while resetting your portfolio.");
      }
    },
  }))
);