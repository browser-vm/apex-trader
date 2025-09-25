import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { getQuote } from '@/lib/stock-api';
import { useEffect, useState } from 'react';
import type { StockQuote } from '@shared/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
const WatchlistItem = ({ symbol }: { symbol: string }) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const setActiveSymbol = useStore(state => state.setActiveSymbol);
  useEffect(() => {
    let isMounted = true;
    const fetchQuote = async () => {
      const q = await getQuote(symbol);
      if (isMounted) setQuote(q);
    };
    fetchQuote();
    const interval = setInterval(fetchQuote, 60000); // Refresh every minute
    return () => { 
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);
  if (!quote) {
    return (
      <div className="flex justify-between items-center p-3 font-mono border-b-2 border-black last:border-b-0">
        <div className="space-y-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    );
  }
  const isPositive = quote.change >= 0;
  return (
    <li
      onClick={() => setActiveSymbol(symbol)}
      className="flex justify-between items-center p-3 font-mono cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 border-b-2 border-black last:border-b-0"
    >
      <div>
        <p className="font-bold text-lg">{quote.symbol}</p>
        <p className={cn("text-sm", isPositive ? 'text-apex-green' : 'text-apex-magenta')}>
          {isPositive ? '+' : ''}{quote.change.toFixed(2)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">${quote.price.toFixed(2)}</p>
        <p className={cn("text-sm font-bold", isPositive ? 'text-apex-green' : 'text-apex-magenta')}>
          {isPositive ? '+' : ''}{(quote.changePercent * 100).toFixed(2)}%
        </p>
      </div>
    </li>
  );
};
export const Watchlist = () => {
  const { watchlist, activeSymbol, addToWatchlist } = useStore(
    useShallow(state => ({
      watchlist: state.watchlist,
      activeSymbol: state.activeSymbol,
      addToWatchlist: state.addToWatchlist,
    }))
  );
  const isSymbolInWatchlist = watchlist.includes(activeSymbol);
  return (
    <div className="border-2 border-black p-4 bg-white dark:bg-neutral-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold uppercase">Watchlist</h2>
        <button
          onClick={() => addToWatchlist(activeSymbol)}
          disabled={isSymbolInWatchlist}
          className="font-mono text-sm font-bold uppercase border-2 border-black px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white dark:hover:bg-neutral-200 dark:hover:text-black transition-colors"
        >
          {isSymbolInWatchlist ? 'ADDED' : 'ADD CURRENT'}
        </button>
      </div>
      <ul className="border-2 border-black">
        {watchlist.length > 0 ? (
          watchlist.map(symbol => <WatchlistItem key={symbol} symbol={symbol} />)
        ) : (
          <p className="p-4 text-center text-neutral-500 font-mono">Your watchlist is empty.</p>
        )}
      </ul>
    </div>
  );
};