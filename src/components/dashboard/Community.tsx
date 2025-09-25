import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaderboard } from './Leaderboard';
import { Achievements } from './Achievements';
import { Button } from "../ui/button";
import { useStore } from "@/lib/store";
import { RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
export const Community = () => {
  const resetPortfolio = useStore(state => state.resetPortfolio);
  return (
    <div className="border-2 border-black p-4 bg-white dark:bg-neutral-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold uppercase">Community</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="font-mono text-xs font-bold uppercase border-2 border-black px-2 py-1 rounded-none h-auto bg-apex-magenta text-black hover:bg-black hover:text-apex-magenta"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              RESET
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-mono border-2 border-black rounded-none bg-white dark:bg-black">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display uppercase">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently reset your portfolio, trade history, and achievements to the starting state of $100,000 cash.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none border-2 border-black">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => resetPortfolio()}
                className="rounded-none border-2 border-black bg-apex-magenta text-black hover:bg-black hover:text-apex-magenta"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-neutral-200 dark:bg-neutral-800 p-0 border-2 border-black">
          <TabsTrigger value="leaderboard" className="rounded-none font-mono font-bold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">LEADERBOARD</TabsTrigger>
          <TabsTrigger value="achievements" className="rounded-none font-mono font-bold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">ACHIEVEMENTS</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="mt-4">
          <Leaderboard />
        </TabsContent>
        <TabsContent value="achievements" className="mt-4">
          <Achievements />
        </TabsContent>
      </Tabs>
    </div>
  );
};