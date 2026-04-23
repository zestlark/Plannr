import React from 'react';

interface TopNavBarProps {
  onMenuToggle?: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const TopNavBar = ({ onMenuToggle, searchQuery, setSearchQuery }: TopNavBarProps) => {

  return (
    <header className="flex justify-between items-center w-full px-gutter md:px-xl h-20 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/50 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 hover:bg-surface-container rounded-xl text-on-surface transition-colors border border-outline-variant/20"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        
        {/* Page Context (Static for now since it's a simple app) */}
        <div className="hidden sm:flex flex-col">
          <h1 className="text-on-surface font-bold text-lg tracking-tight">Shopping Manager</h1>
          <div className="flex items-center gap-sm">
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant/60">Local Storage Active</span>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-gutter">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:bg-surface-container focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium placeholder-on-surface-variant/40"
            placeholder="Search through categories and items..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <button 
          className="p-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant transition-all hover:scale-110 border border-transparent hover:border-outline-variant/30"
          onClick={() => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
          }}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
        </button>
        
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-primary-container p-[1px] shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform active:scale-95">
          <div className="h-full w-full rounded-full bg-surface-container flex items-center justify-center font-black text-xs text-primary border border-surface">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};
