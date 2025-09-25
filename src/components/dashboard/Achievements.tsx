import { useStore } from '@/lib/store';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { CheckCircle2, Award, TrendingUp, TrendingDown, Gem, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const iconMap: { [key: string]: React.ElementType } = {
  'first_trade': Award,
  'profit_maker': TrendingUp,
  'paper_hands': TrendingDown,
  'diversified': Gem,
  'baller': Rocket,
};
export const Achievements = () => {
  const unlockedAchievementIds = useStore(state => state.portfolio?.achievements) || [];
  return (
    <div className="border-2 border-black p-4 bg-white dark:bg-neutral-900">
      <div className="grid grid-cols-4 gap-4">
        <TooltipProvider>
          {ALL_ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlockedAchievementIds.includes(ach.id);
            const Icon = iconMap[ach.id] || CheckCircle2;
            return (
              <Tooltip key={ach.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square border-2 border-black flex items-center justify-center transition-all",
                      isUnlocked ? 'bg-apex-green text-black' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                    )}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="font-mono border-2 border-black rounded-none bg-white dark:bg-black text-black dark:text-white">
                  <p className="font-bold">{ach.name}</p>
                  <p>{ach.description}</p>
                  {isUnlocked && <p className="font-bold text-apex-green">UNLOCKED</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};