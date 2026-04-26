import { Outlet } from "react-router-dom";
import { SideNavBar } from "@/components/Navigation/SideNavBar";
import { TopNavBar } from "@/components/Navigation/TopNavBar";
import { useState } from "react";

export const MainLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden w-screen">
      <SideNavBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0  h-screen overflow-hidden relative w-full">
        <TopNavBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
