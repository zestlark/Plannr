import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/AppContext';
import { clsx } from 'clsx';

interface PeopleFilterProps {
  selectedPersons: string[];
  onChange: (persons: string[]) => void;
}

export const PeopleFilter = ({ selectedPersons, onChange }: PeopleFilterProps) => {
  const { persons } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePerson = (name: string) => {
    if (selectedPersons.includes(name)) {
      onChange(selectedPersons.filter(p => p !== name));
    } else {
      onChange([...selectedPersons, name]);
    }
  };

  const clearFilters = () => {
    onChange([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center justify-center gap-xs px-md py-sm rounded-xl font-button text-button transition-all shadow-sm border whitespace-nowrap",
          selectedPersons.length > 0 
            ? "bg-primary/10 border-primary text-primary" 
            : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container"
        )}
      >
        <span className="material-symbols-outlined text-[18px]">person</span>
        <span>People</span>
        {selectedPersons.length > 0 && (
          <span className="bg-primary text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1 font-black">
            {selectedPersons.length}
          </span>
        )}
        <span className="material-symbols-outlined text-[18px] opacity-50">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="p-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <span className="text-[11px] font-black uppercase text-on-surface-variant/70">Filter by People</span>
            {selectedPersons.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-[10px] font-black text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-outline-variant">
            {/* Unassigned Option */}
            <label 
              onClick={() => togglePerson("")}
              className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors group border-b border-outline-variant/30 mb-1 pb-3"
            >
              <div className={clsx(
                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                selectedPersons.includes("") 
                  ? "bg-primary border-primary text-on-primary" 
                  : "bg-transparent border-outline group-hover:border-primary"
              )}>
                {selectedPersons.includes("") && (
                  <span className="material-symbols-outlined text-[12px] font-black">check</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className={clsx(
                  "text-sm transition-colors",
                  selectedPersons.includes("") ? "font-bold text-primary" : "text-on-surface"
                )}>
                  Unassigned
                </span>
                <span className="text-[10px] text-on-surface-variant/60">Items without a person</span>
              </div>
            </label>

            {persons.length === 0 ? (
              <p className="p-4 text-center text-xs text-on-surface-variant italic">No people added yet</p>
            ) : (
              persons.map(name => (
                <label 
                  key={name}
                  onClick={() => togglePerson(name)}
                  className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className={clsx(
                    "w-4 h-4 rounded border flex items-center justify-center transition-all",
                    selectedPersons.includes(name) 
                      ? "bg-primary border-primary text-on-primary" 
                      : "bg-transparent border-outline group-hover:border-primary"
                  )}>
                    {selectedPersons.includes(name) && (
                      <span className="material-symbols-outlined text-[12px] font-black">check</span>
                    )}
                  </div>
                  <span className={clsx(
                    "text-sm transition-colors",
                    selectedPersons.includes(name) ? "font-bold text-primary" : "text-on-surface"
                  )}>
                    {name}
                  </span>
                </label>
              ))
            )}
          </div>
          
          {selectedPersons.length > 0 && (
            <div className="p-2 bg-surface-container-low border-t border-outline-variant">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
