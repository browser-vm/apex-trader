import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getNews } from '@/lib/stock-api';
import type { NewsArticle } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
const NewsItem = ({ article }: { article: NewsArticle }) => {
  const publishedAt = new Date(article.time_published);
  return (
    <div className="p-3 border-b-2 border-black last:border-b-0">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-neutral-100 dark:hover:bg-neutral-800 -m-3 p-3 transition-colors group"
      >
        <div className="flex justify-between items-start">
          <h3 className="font-mono font-bold text-sm leading-tight pr-2 group-hover:underline">
            {article.title}
          </h3>
          <ExternalLink className="h-4 w-4 flex-shrink-0 text-neutral-400" />
        </div>
        <p className="text-xs text-neutral-500 mt-1 font-mono">
          {article.source} &bull; {formatDistanceToNow(publishedAt, { addSuffix: true })}
        </p>
        <p className="text-xs mt-2 font-mono">{article.summary}</p>
      </a>
    </div>
  );
};
export const NewsFeed = () => {
  const activeSymbol = useStore(state => state.activeSymbol);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchNews = async () => {
      if (!activeSymbol) return;
      setIsLoading(true);
      try {
        const fetchedNews = await getNews(activeSymbol);
        setNews(fetchedNews);
      } catch (error) {
        console.error("Failed to fetch news", error);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [activeSymbol]);
  return (
    <div className="border-2 border-black p-4 bg-white dark:bg-neutral-900">
      <h2 className="font-display text-xl font-bold uppercase mb-4">News Feed</h2>
      <ScrollArea className="h-96 border-2 border-black">
        {isLoading ? (
          <div className="p-3 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          news.map((article, index) => <NewsItem key={index} article={article} />)
        ) : (
          <p className="p-4 text-center text-neutral-500 font-mono">
            No recent news for {activeSymbol}.
          </p>
        )}
      </ScrollArea>
    </div>
  );
};