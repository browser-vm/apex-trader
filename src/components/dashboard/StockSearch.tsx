import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { searchStocks } from '@/lib/stock-api';
import type { StockQuote } from '@shared/types';
import { useDebounce } from 'react-use';
export const StockSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setActiveSymbol = useStore(state => state.setActiveSymbol);
  useDebounce(() => setDebouncedQuery(query), 300, [query]);
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim() === '') {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const searchResults = await searchStocks(debouncedQuery);
      setResults(searchResults);
      setIsLoading(false);
    };
    performSearch();
  }, [debouncedQuery]);
  const handleSelect = (symbol: string) => {
    setActiveSymbol(symbol);
    setQuery('');
    setResults([]);
  };
  return (
    <div className="relative border-2 border-black p-4 space-y-4 bg-white dark:bg-neutral-900">
      <h2 className="font-display text-xl font-bold uppercase">Search Ticker</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <Input
          type="text"
          placeholder="e.g., TSLA"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 font-mono uppercase border-2 border-black focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-neutral-200 rounded-none"
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
      </div>
      {results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-10 mt-1 border-2 border-black bg-white dark:bg-neutral-900 max-h-60 overflow-y-auto">
          {results.map((stock) => (
            <li
              key={stock.symbol}
              onClick={() => handleSelect(stock.symbol)}
              className="flex justify-between items-center p-3 font-mono cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 border-b-2 border-black last:border-b-0"
            >
              <div>
                <p className="font-bold">{stock.symbol}</p>
                <p className="text-xs text-neutral-500 truncate">{stock.companyName}</p>
              </div>
              <p className="font-bold">${stock.price.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};