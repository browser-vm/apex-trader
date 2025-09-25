import { ThemeToggle } from "@/components/ThemeToggle";
export const Header = () => {
  return (
    <header className="flex items-center justify-between border-b-4 border-black dark:border-neutral-200 py-2">
      <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-widest">
        Apex Trader
      </h1>
      <ThemeToggle className="relative top-0 right-0" />
    </header>
  );
};