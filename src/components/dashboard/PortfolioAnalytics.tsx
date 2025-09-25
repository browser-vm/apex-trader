import { useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const portfolioValue = payload[0].value;
    const benchmarkValue = payload[1].value;
    const initialPortfolio = payload[0].payload.initialPortfolioValue;
    // The benchmark value is already normalized, so its initial value for comparison is the same as the portfolio's
    const initialBenchmark = payload[0].payload.initialPortfolioValue; 
    const portfolioReturn = (portfolioValue / initialPortfolio - 1) * 100;
    const benchmarkReturn = (benchmarkValue / initialBenchmark - 1) * 100;
    return (
      <div className="bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-black dark:border-white font-mono text-sm">
        <p className="label font-bold">{label}</p>
        <p className="text-apex-green">Portfolio: <span className="font-bold">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({portfolioReturn.toFixed(2)}%)</span></p>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>SPY: <span className="font-bold">${benchmarkValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({benchmarkReturn.toFixed(2)}%)</span></p>
      </div>);
  }
  return null;
};
export const PortfolioAnalytics = () => {
  const {
    portfolio,
    tradeHistory,
    portfolioHistory,
    isHistoryLoading,
    fetchAnalyticsData
  } = useStore(
    useShallow((state) => ({
      portfolio: state.portfolio,
      tradeHistory: state.portfolio?.tradeHistory,
      portfolioHistory: state.portfolioHistory,
      isHistoryLoading: state.isHistoryLoading,
      fetchAnalyticsData: state.fetchAnalyticsData
    }))
  );
  useEffect(() => {
    if (tradeHistory && tradeHistory.length > 0) {
      fetchAnalyticsData();
    }
  }, [tradeHistory, fetchAnalyticsData]);
  const { totalPL, totalROI } = useMemo(() => {
    if (!portfolioHistory || portfolioHistory.length < 2) {
      return { totalPL: 0, totalROI: 0 };
    }
    const startValue = portfolioHistory[0].value;
    const endValue = portfolioHistory[portfolioHistory.length - 1].value;
    const pl = endValue - startValue;
    const roi = startValue !== 0 ? (pl / startValue) * 100 : 0;
    return { totalPL: pl, totalROI: roi };
  }, [portfolioHistory]);
  const isLoading = useStore(state => state.isPortfolioLoading);
  if (isLoading || !portfolio) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>);
  }
  const isPositive = totalPL >= 0;
  if (!tradeHistory || tradeHistory.length === 0) {
    return (
      <div className="p-4 text-center font-mono text-neutral-500">
        No trade history available. Place a trade to see analytics.
      </div>);
  }
  if (isHistoryLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>);
  }
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        <div className="border-2 border-black p-4">
          <p className="text-sm text-neutral-500 uppercase">Total P/L</p>
          <p className={cn("text-3xl font-bold", isPositive ? 'text-apex-green' : 'text-apex-magenta')}>
            {isPositive ? '+' : ''}${totalPL.toFixed(2)}
          </p>
        </div>
        <div className="border-2 border-black p-4">
          <p className="text-sm text-neutral-500 uppercase">Total ROI</p>
          <p className={cn("text-3xl font-bold", isPositive ? 'text-apex-green' : 'text-apex-magenta')}>
            {isPositive ? '+' : ''}{totalROI.toFixed(2)}%
          </p>
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold uppercase mb-2">Performance vs. S&P 500 (SPY)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--apex-green))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--apex-green))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 5" stroke="currentColor" strokeOpacity={0.2} />
              <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 12 }} stroke="currentColor" className="font-mono" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fill: 'currentColor', fontSize: 12 }} stroke="currentColor" className="font-mono" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--apex-green))" fillOpacity={1} fill="url(#colorPortfolio)" name="Portfolio" />
              <Area type="monotone" dataKey="benchmarkValue" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorBenchmark)" name="S&P 500 (SPY)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>);
};