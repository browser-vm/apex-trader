import { useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { OrderForm } from '@/components/dashboard/OrderForm';
import { Portfolio } from '@/components/dashboard/Portfolio';
import { StockChart } from '@/components/dashboard/StockChart';
import { StockSearch } from '@/components/dashboard/StockSearch';
import { Watchlist } from '@/components/dashboard/Watchlist';
import { Community } from '@/components/dashboard/Community';
import { useStore } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  const initStore = useStore(state => state.init);
  useEffect(() => {
    initStore();
  }, [initStore]);
  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] min-h-screen font-sans">
      <main className="max-w-screen-2xl mx-auto p-4 md:p-6 space-y-4">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-4">
            <StockSearch />
            <Watchlist />
          </div>
          {/* Center Column */}
          <div className="lg:col-span-6">
            <StockChart />
            <OrderForm />
          </div>
          {/* Right Column */}
          <div className="lg:col-span-3 space-y-4">
            <Portfolio />
            <Community />
          </div>
        </div>
        <footer className="text-center py-4 text-neutral-500 font-mono text-sm">
            Built with ❤️ at Cloudflare
        </footer>
      </main>
      <Toaster
        theme="system"
        toastOptions={{
          style: {
            fontFamily: 'JetBrains Mono, monospace',
            border: '2px solid #0A0A0A',
            borderRadius: '0px',
          }
        }}
      />
    </div>
  );
}