import { Outlet, useLocation } from "react-router-dom";
import { SideNavBar } from "@/components/Navigation/SideNavBar";
import { TopNavBar } from "@/components/Navigation/TopNavBar";
import { useState } from "react";

export const MainLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden w-screen">
      <SideNavBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative w-full">
        <TopNavBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-gutter md:p-xl scrollbar-thin scrollbar-thumb-outline-variant hover:scrollbar-thumb-outline">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
