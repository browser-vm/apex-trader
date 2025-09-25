import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderType } from '@shared/types';
export const OrderForm = () => {
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const { activeSymbol, activeQuote, cash, executeTrade, isSubmittingOrder } = useStore(
    useShallow(state => ({
      activeSymbol: state.activeSymbol,
      activeQuote: state.activeQuote,
      cash: state.portfolio?.cash ?? 0,
      executeTrade: state.executeTrade,
      isSubmittingOrder: state.isSubmittingOrder,
    }))
  );
  const handleTrade = (type: 'BUY' | 'SELL') => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return;
    }
    executeTrade({
      symbol: activeSymbol,
      quantity: numQuantity,
      type,
      orderType,
      limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
      stopPrice: orderType === 'STOP' ? parseFloat(stopPrice) : undefined,
    });
    setQuantity('');
    setLimitPrice('');
    setStopPrice('');
  };
  const estimatedCost = (activeQuote?.price ?? 0) * (parseInt(quantity, 10) || 0);
  const renderOrderInputs = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="quantity" className="font-mono text-sm font-bold">QUANTITY</label>
        <Input
          id="quantity"
          type="number"
          placeholder="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          className="font-mono border-2 border-black rounded-none text-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-neutral-200"
        />
      </div>
      {orderType === 'LIMIT' && (
        <div className="space-y-1">
          <label htmlFor="limitPrice" className="font-mono text-sm font-bold">LIMIT PRICE</label>
          <Input
            id="limitPrice"
            type="number"
            placeholder="0.00"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="font-mono border-2 border-black rounded-none text-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-neutral-200"
          />
        </div>
      )}
      {orderType === 'STOP' && (
        <div className="space-y-1">
          <label htmlFor="stopPrice" className="font-mono text-sm font-bold">STOP PRICE</label>
          <Input
            id="stopPrice"
            type="number"
            placeholder="0.00"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            className="font-mono border-2 border-black rounded-none text-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-neutral-200"
          />
        </div>
      )}
      <div className="font-mono text-sm flex justify-between">
        <span>EST. COST:</span>
        <span className="font-bold">${estimatedCost.toFixed(2)}</span>
      </div>
      <div className="font-mono text-sm flex justify-between">
        <span>CASH AVAILABLE:</span>
        <span className="font-bold">${cash.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleTrade('BUY')}
          disabled={isSubmittingOrder || !quantity}
          className={cn(
            "w-full rounded-none border-2 border-black text-lg font-bold h-12",
            "bg-apex-green text-black hover:bg-black hover:text-apex-green",
            "dark:hover:bg-apex-green dark:hover:text-black"
          )}
        >
          {isSubmittingOrder ? <Loader2 className="animate-spin" /> : 'BUY'}
        </Button>
        <Button
          onClick={() => handleTrade('SELL')}
          disabled={isSubmittingOrder || !quantity}
          className={cn(
            "w-full rounded-none border-2 border-black text-lg font-bold h-12",
            "bg-apex-magenta text-black hover:bg-black hover:text-apex-magenta",
            "dark:hover:bg-apex-magenta dark:hover:text-black"
          )}
        >
          {isSubmittingOrder ? <Loader2 className="animate-spin" /> : 'SELL'}
        </Button>
      </div>
    </div>
  );
  return (
    <div className="border-2 border-black p-4 bg-white dark:bg-neutral-900 mt-4">
      <h2 className="font-display text-xl font-bold uppercase mb-4">Place Order</h2>
      <Tabs defaultValue="MARKET" onValueChange={(v) => setOrderType(v as OrderType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-none bg-neutral-200 dark:bg-neutral-800 p-0 border-2 border-black">
          <TabsTrigger value="MARKET" className="rounded-none font-mono font-bold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">MARKET</TabsTrigger>
          <TabsTrigger value="LIMIT" className="rounded-none font-mono font-bold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">LIMIT</TabsTrigger>
          <TabsTrigger value="STOP" className="rounded-none font-mono font-bold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">STOP</TabsTrigger>
        </TabsList>
        <TabsContent value="MARKET" className="mt-4">{renderOrderInputs()}</TabsContent>
        <TabsContent value="LIMIT" className="mt-4">{renderOrderInputs()}</TabsContent>
        <TabsContent value="STOP" className="mt-4">{renderOrderInputs()}</TabsContent>
      </Tabs>
    </div>
  );
};