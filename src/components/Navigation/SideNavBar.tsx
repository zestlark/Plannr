import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

interface SideNavBarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const SideNavBar = ({ isOpen, setIsOpen }: SideNavBarProps) => {
  const tabs = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: 'dashboard' },
    { id: 'people', path: '/people', label: 'People', icon: 'groups' },
    { id: 'expense', path: '/summary', label: 'Expense Summary', icon: 'payments' },
    { id: 'data', path: '/settings', label: 'Data Portability', icon: 'database' }
  ];

  return (
    <nav className={clsx(
      "fixed inset-y-0 left-0 z-30 w-64 border-r border-outline-variant bg-surface p-4 flex flex-col gap-2 transition-transform duration-300 transform md:relative md:translate-x-0 shrink-0 shadow-lg md:shadow-none",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Header */}
      <div className="flex items-center gap-sm px-sm mb-lg mt-sm">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
          <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
        </div>
        <div className="min-w-0">
          <h2 className="font-h2 text-h2 text-on-surface truncate leading-tight uppercase tracking-wide">Villa List</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Premium Organizer</p>
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="flex flex-col gap-sm flex-1 mt-md">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => clsx(
              "flex items-center gap-md px-md py-sm rounded-xl group transition-all duration-200 border border-transparent shadow-sm",
              isActive 
                ? 'bg-primary text-on-primary shadow-primary/20 border-primary shadow-md translate-x-1' 
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            )}
          >
            <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
            <span className="font-button text-button font-semibold">{tab.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-auto p-md bg-surface-container-low rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-sm">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="font-body-sm text-body-sm font-medium text-on-surface-variant">Cloud Active</span>
        </div>
      </div>
    </nav>
  );
};
