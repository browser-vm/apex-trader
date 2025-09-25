import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
export const Leaderboard = () => {
  const { leaderboardData, isLoading, fetchLeaderboard } = useStore(
    useShallow(state => ({
      leaderboardData: state.leaderboardData,
      isLoading: state.isLeaderboardLoading,
      fetchLeaderboard: state.fetchLeaderboard,
    }))
  );
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  return (
    <div className="border-2 border-black">
      <Table className="font-mono">
        <TableHeader>
          <TableRow className="border-b-2 border-black hover:bg-transparent">
            <TableHead className="w-1/6 text-black dark:text-white font-bold">RANK</TableHead>
            <TableHead className="w-3/6 text-black dark:text-white font-bold">USER</TableHead>
            <TableHead className="w-2/6 text-right text-black dark:text-white font-bold">VALUE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.map((entry, index) => (
            <TableRow key={entry.userId} className={cn("border-b-2 border-black last:border-b-0", index < 3 && "font-bold")}>
              <TableCell>#{entry.rank}</TableCell>
              <TableCell>{entry.username}</TableCell>
              <TableCell className="text-right">${entry.portfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};