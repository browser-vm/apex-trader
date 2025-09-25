import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { getQuote } from '@/lib/stock-api';
import type { Position, StockQuote } from '@shared/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioAnalytics } from './PortfolioAnalytics';
const PortfolioItem = ({ position, onValueChange }: { position: Position, onValueChange: (symbol: string, value: number) => void }) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const setActiveSymbol = useStore(state => state.setActiveSymbol);
  useEffect(() => {
    let isMounted = true;
    const fetchQuote = async () => {
      const q = await getQuote(position.symbol);
      if (isMounted) {
        setQuote(q);
        if (q) {
          onValueChange(position.symbol, position.quantity * q.price);
        }
      }
    };
    fetchQuote();
    const interval = setInterval(fetchQuote, 60000); // Refresh every minute
    return () => {
        isMounted = false;
        clearInterval(interval);
    };
  }, [position.symbol, position.quantity, onValueChange]);
  if (!quote) {
    return (
      <div className="flex justify-between items-center p-3 font-mono border-b-2 border-black last:border-b-0">
        <div className="space-y-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }
  const marketValue = position.quantity * quote.price;
  const totalCost = position.quantity * position.averagePrice;
  const unrealizedPL = marketValue - totalCost;
  const isPositive = unrealizedPL >= 0;
  return (
    <li
      onClick={() => setActiveSymbol(position.symbol)}
      className="flex justify-between items-center p-3 font-mono cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 border-b-2 border-black last:border-b-0"
    >
      <div>
        <p className="font-bold text-lg">{position.symbol}</p>
        <p className="text-xs text-neutral-500">{position.quantity} SHARES</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">${marketValue.toFixed(2)}</p>
        <p className={cn("text-sm font-bold", isPositive ? 'text-apex-green' : 'text-apex-magenta')}>
          {isPositive ? '+' : ''}${unrealizedPL.toFixed(2)}
        </p>
      </div>
    </li>
  );
};
export const Portfolio = () => {
  const { portfolio, isLoading } = useStore(
    useShallow(state => ({
      portfolio: state.portfolio,
      isLoading: state.isPortfolioLoading,
    }))
  );
  const [marketValues, setMarketValues] = useState<Record<string, number>>({});
  const handleValueChange = useCallback((symbol: string, value: number) => {
    setMarketValues(prev => ({ ...prev, [symbol]: value }));
  }, []);
  const totalStockValue = useMemo(() => {
    return Object.values(marketValues).reduce((acc, value) => acc + value, 0);
  }, [marketValues]);
  const totalPortfolioValue = (portfolio?.cash ?? 0) + totalStockValue;
  useEffect(() => {
    setMarketValues({});
  }, [portfolio?.positions]);
  if (isLoading || !portfolio) {
    return (
      <div className="border-2 border-black p-4 bg-white dark:bg-neutral-900 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-12 w-full" />
        <div className="border-2 border-black p-2 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="border-2 border-black p-4 bg-white dark:bg-neutral-900">
      <h2 className="font-display text-xl font-bold uppercase">Portfolio</h2>
      <div className="my-4">
        <p className="font-mono text-sm text-neutral-500">TOTAL VALUE</p>
        <p className="font-mono text-4xl font-bold">${totalPortfolioValue.toFixed(2)}</p>
      </div>
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-neutral-200 dark:bg-neutral-800 p-0 border-2 border-black">
          <TabsTrigger value="positions" className="rounded-none font-mono font-bold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">POSITIONS</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-none font-mono font-bold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">ANALYTICS</TabsTrigger>
        </TabsList>
        <TabsContent value="positions" className="mt-4">
          <div className="border-2 border-black">
            <div className="p-3 border-b-2 border-black">
              <p className="font-mono text-lg font-bold flex justify-between">
                <span>CASH</span>
                <span>${portfolio.cash.toFixed(2)}</span>
              </p>
            </div>
            <ul>
              {portfolio.positions.length > 0 ? (
                portfolio.positions.map(pos => <PortfolioItem key={pos.symbol} position={pos} onValueChange={handleValueChange} />)
              ) : (
                <p className="p-4 text-center text-neutral-500 font-mono">You have no open positions.</p>
              )}
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <PortfolioAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};