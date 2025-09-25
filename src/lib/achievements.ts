import type { Achievement, Portfolio, Trade } from '@shared/types';
export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Execute your first trade.',
    icon: 'Award',
  },
  {
    id: 'profit_maker',
    name: 'Profit Maker',
    description: 'Close a position for a profit.',
    icon: 'TrendingUp',
  },
  {
    id: 'paper_hands',
    name: 'Paper Hands',
    description: 'Close a position for a loss.',
    icon: 'TrendingDown',
  },
  {
    id: 'diversified',
    name: 'Diversified',
    description: 'Hold positions in 5 different stocks at once.',
    icon: 'Gem',
  },
  {
    id: 'baller',
    name: 'Baller',
    description: 'Grow your portfolio value to $110,000.',
    icon: 'Rocket',
  },
];
type AchievementCheck = (portfolio: Portfolio, lastTrade?: Trade) => boolean;
const achievementChecks: Record<string, AchievementCheck> = {
  first_trade: (portfolio) => portfolio.tradeHistory.length > 0,
  profit_maker: (portfolio, lastTrade) => {
    if (lastTrade?.type !== 'SELL') return false;
    // Find the original cost basis for the shares sold in the last trade.
    // This is a simplified calculation. A real system would be more complex.
    const buyTrades = portfolio.tradeHistory.filter(t => t.symbol === lastTrade.symbol && t.type === 'BUY');
    if (buyTrades.length === 0) return false;
    const totalCost = buyTrades.reduce((acc, t) => acc + t.price * t.quantity, 0);
    const totalQuantity = buyTrades.reduce((acc, t) => acc + t.quantity, 0);
    const avgBuyPrice = totalCost / totalQuantity;
    return lastTrade.price > avgBuyPrice;
  },
  paper_hands: (portfolio, lastTrade) => {
    if (lastTrade?.type !== 'SELL') return false;
    const buyTrades = portfolio.tradeHistory.filter(t => t.symbol === lastTrade.symbol && t.type === 'BUY');
    if (buyTrades.length === 0) return false;
    const totalCost = buyTrades.reduce((acc, t) => acc + t.price * t.quantity, 0);
    const totalQuantity = buyTrades.reduce((acc, t) => acc + t.quantity, 0);
    const avgBuyPrice = totalCost / totalQuantity;
    return lastTrade.price < avgBuyPrice;
  },
  diversified: (portfolio) => portfolio.positions.length >= 5,
  baller: (portfolio) => {
    const holdingsValue = portfolio.positions.reduce((acc, pos) => acc + (pos.quantity * pos.averagePrice), 0); // Simplified, uses avg price
    const totalValue = portfolio.cash + holdingsValue;
    return totalValue >= 110000;
  },
};
export const checkAchievements = (portfolio: Portfolio): string[] => {
  const unlocked: string[] = [];
  const lastTrade = portfolio.tradeHistory[portfolio.tradeHistory.length - 1];
  for (const achievement of ALL_ACHIEVEMENTS) {
    if (portfolio.achievements.includes(achievement.id)) {
      continue; // Already unlocked
    }
    if (achievementChecks[achievement.id]?.(portfolio, lastTrade)) {
      unlocked.push(achievement.id);
    }
  }
  return unlocked;
};