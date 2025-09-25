import { useStore, TimeRange } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Line } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import type { StockDataPoint } from '@shared/types';
import { Toggle } from '@/components/ui/toggle';
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-black dark:border-white font-mono text-sm">
        <p className="label font-bold">{`${label}`}</p>
        <p>O: <span className="font-bold">{data.open.toFixed(2)}</span></p>
        <p>H: <span className="font-bold">{data.high.toFixed(2)}</span></p>
        <p>L: <span className="font-bold">{data.low.toFixed(2)}</span></p>
        <p>C: <span className="font-bold">{data.close.toFixed(2)}</span></p>
        {data.sma20 && <p className="text-amber-500">SMA20: <span className="font-bold">{data.sma20.toFixed(2)}</span></p>}
        {data.sma50 && <p className="text-sky-500">SMA50: <span className="font-bold">{data.sma50.toFixed(2)}</span></p>}
        <p>Vol: <span className="font-bold">{(data.volume / 1_000_000).toFixed(2)}M</span></p>
      </div>
    );
  }
  return null;
};
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isRising = close > open;
  const ratio = Math.abs(height / (high - low));
  return (
    <g stroke="currentColor" fill={isRising ? 'none' : "currentColor"} strokeWidth="2">
      <path
        d={`
          M ${x + width / 2}, ${y}
          L ${x + width / 2}, ${y + ratio * (high - Math.max(open, close))}
          M ${x + width / 2}, ${y + ratio * (high - Math.min(open, close))}
          L ${x + width / 2}, ${y + height}
        `}
      />
      <rect
        x={x}
        y={y + ratio * (high - Math.max(open, close))}
        width={width}
        height={ratio * Math.abs(open - close)}
      />
    </g>
  );
};
const TimeRangeSelector = ({ onToggleMAs, showMAs }: { onToggleMAs: () => void, showMAs: boolean }) => {
    const { activeTimeRange, setActiveTimeRange, isHistoryLoading } = useStore(useShallow(state => ({
        activeTimeRange: state.activeTimeRange,
        setActiveTimeRange: state.setActiveTimeRange,
        isHistoryLoading: state.isHistoryLoading,
    })));
    const ranges: TimeRange[] = ['1D', '5D', '1M', '6M', '1Y'];
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
                {ranges.map(range => (
                    <button
                        key={range}
                        onClick={() => !isHistoryLoading && setActiveTimeRange(range)}
                        disabled={isHistoryLoading}
                        className={cn(
                            "font-mono text-sm font-bold uppercase border-2 border-black px-2 py-1 transition-colors",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            activeTimeRange === range
                                ? "bg-black text-white dark:bg-neutral-200 dark:text-black"
                                : "hover:bg-black hover:text-white dark:hover:bg-neutral-200 dark:hover:text-black"
                        )}
                    >
                        {range}
                    </button>
                ))}
            </div>
            <Toggle
                pressed={showMAs}
                onPressedChange={onToggleMAs}
                aria-label="Toggle Moving Averages"
                className="font-mono text-sm font-bold uppercase border-2 border-black px-2 py-1 data-[state=on]:bg-black data-[state=on]:text-white dark:data-[state=on]:bg-neutral-200 dark:data-[state=on]:text-black"
            >
                MA
            </Toggle>
        </div>
    );
};
const calculateSMA = (data: StockDataPoint[], period: number) => {
    const result = [];
    if (data.length < period) {
        return data.map(d => ({ ...d }));
    }

    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }

    for (let i = 0; i < data.length; i++) {
        const point = { ...data[i] };
        if (i < period - 1) {
            result.push(point);
        } else {
            if (i >= period) {
                sum = sum - data[i - period].close + data[i].close;
            }
            result.push({ ...point, [`sma${period}`]: sum / period });
        }
    }
    return result;
};
export const StockChart = () => {
  const { quote, history, isQuoteLoading, isHistoryLoading } = useStore(
    useShallow(state => ({
      quote: state.activeQuote,
      history: state.activePriceHistory,
      isQuoteLoading: state.isQuoteLoading,
      isHistoryLoading: state.isHistoryLoading,
    }))
  );
  const [showMAs, setShowMAs] = useState(true);
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    const dataWithSMA20 = calculateSMA(history, 20);
    const dataWithAllSMAs = calculateSMA(dataWithSMA20, 50);
    return dataWithAllSMAs;
  }, [history]);
  if (isQuoteLoading || !quote) {
    return (
      <div className="border-4 border-black p-4 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex justify-between items-baseline">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  const isPositive = quote.change >= 0;
  const domain = [
    Math.min(...history.map(d => d.low)) * 0.98,
    Math.max(...history.map(d => d.high)) * 1.02,
  ];
  const volDomain = [0, Math.max(...history.map(d => d.volume)) * 2];
  return (
    <div className="border-4 border-black p-4 bg-white dark:bg-neutral-900">
      <div className="mb-4">
        <div className="flex justify-between items-baseline">
          <h2 className="font-display text-4xl font-bold uppercase">{quote.symbol}</h2>
          <p className="font-mono text-4xl font-bold">${quote.price.toFixed(2)}</p>
        </div>
        <p className="font-mono text-neutral-500">{quote.companyName}</p>
        <p className={cn("font-mono text-lg font-bold", isPositive ? 'text-apex-green' : 'text-apex-magenta')}>
          {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{(quote.changePercent * 100).toFixed(2)}%)
        </p>
      </div>
      <div className="mb-4">
        <TimeRangeSelector showMAs={showMAs} onToggleMAs={() => setShowMAs(prev => !prev)} />
      </div>
      <div className="h-[400px]">
        {isHistoryLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="1 5" stroke="currentColor" strokeOpacity={0.2} />
              <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 12 }} stroke="currentColor" className="font-mono" />
              <YAxis yAxisId="left" domain={domain} tick={{ fill: 'currentColor', fontSize: 12 }} stroke="currentColor" className="font-mono" />
              <YAxis yAxisId="right" orientation="right" domain={volDomain} tick={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Bar yAxisId="right" dataKey="volume" barSize={20}>
                {history.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.close > entry.open ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 0, 255, 0.3)'} />
                ))}
              </Bar>
              <Bar yAxisId="left" dataKey="close" shape={<Candlestick />}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} className={entry.close > entry.open ? 'text-apex-green' : 'text-apex-magenta'} />
                ))}
              </Bar>
              {showMAs && (
                <>
                  <Line yAxisId="left" type="monotone" dataKey="sma20" stroke="#ffca28" strokeWidth={2} dot={false} name="SMA 20" />
                  <Line yAxisId="left" type="monotone" dataKey="sma50" stroke="#29b6f6" strokeWidth={2} dot={false} name="SMA 50" />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};