import { useAppStore } from "@/store/AppContext";
import {
  Search,
  Menu,
  Moon,
  Sun,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TopNavBarProps {
  onMenuToggle?: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const TopNavBar = ({
  onMenuToggle,
  searchQuery,
  setSearchQuery,
}: TopNavBarProps) => {
  const { activePlan } = useAppStore();

  return (
    <header className="flex h-16 items-center justify-between px-6 border-b bg-card/50 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Plans</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-foreground truncate max-w-[200px]">
            {activePlan?.title || "Dashboard"}
          </span>
          <Badge
            variant="outline"
            className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]"
          >
            LIVE
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            className="pl-9 pr-12 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/20 h-9 text-sm transition-all"
            placeholder="Search tasks..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border bg-background text-[10px] font-medium text-muted-foreground/60 shadow-sm">
            <span className="text-[12px]">⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={() => {
            const isDark = document.documentElement.classList.toggle("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
          }}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hidden sm:flex"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hidden sm:flex"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary cursor-pointer hover:bg-primary/20 transition-colors ml-2">
          AD
        </div>
      </div>
    </header>
  );
};
