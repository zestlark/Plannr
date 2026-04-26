import { NavLink, useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Database, 
  ArrowLeft, 
  ShoppingCart,
  Cloud
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SideNavBarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const SideNavBar = ({ isOpen, setIsOpen }: SideNavBarProps) => {
  const { planId } = useParams();

  const tabs = [
    {
      id: "dashboard",
      path: `/p/${planId}`,
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      id: "people",
      path: `/p/${planId}/people`,
      label: "People",
      icon: Users,
    },
    {
      id: "expense",
      path: `/p/${planId}/summary`,
      label: "Expenses",
      icon: Wallet,
    },
    {
      id: "data",
      path: `/p/${planId}/settings`,
      label: "Data Settings",
      icon: Database,
    },
  ];

  return (
    <nav
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col transition-transform duration-300 transform md:relative md:translate-x-0 shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <ShoppingCart className="text-primary-foreground w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight leading-none">
              PLANNR
            </h2>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
              Unified Organizer
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Plans
            </Link>
          </Button>
        </div>

        <div className="space-y-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )
              }
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Cloud Sync Active
          </span>
          <Cloud className="h-3 w-3 ml-auto text-muted-foreground/50" />
        </div>
      </div>
    </nav>
  );
};
