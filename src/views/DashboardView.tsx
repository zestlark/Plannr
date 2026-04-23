import { useAppStore } from '@/store/AppContext';
import { Board } from '@/components/Board/Board';
import { useState } from 'react';
import { PeopleFilter } from '@/components/Toolbar/PeopleFilter';

interface DashboardViewProps {
  searchQuery: string;
}

export const DashboardView = ({ searchQuery }: DashboardViewProps) => {
  const { addCategory, sortAllItems } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);

  const handleAdd = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-lg">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Shopping Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage lists and assignments for the upcoming villa trip.</p>
        </div>
        <div className="flex items-center gap-sm self-stretch sm:self-auto">
          <PeopleFilter 
            selectedPersons={selectedPersons} 
            onChange={setSelectedPersons} 
          />

          <button onClick={sortAllItems} className="flex items-center justify-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container rounded-xl font-button text-button transition-colors shadow-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Sort
          </button>
          
          {isAdding ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
               <input 
                autoFocus
                className="px-3 py-2 bg-surface-container-lowest border border-primary rounded-lg text-sm outline-none shadow-inner w-40 sm:w-60"
                placeholder="Category name..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <button 
                onClick={handleAdd}
                className="bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="bg-surface-container-high text-on-surface p-2 rounded-lg hover:bg-surface-container-highest transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)} 
              className="flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl font-button text-button transition-all shadow-md hover:shadow-primary/20 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Add Category
            </button>
          )}
        </div>
      </div>
      
      <Board searchQuery={searchQuery} peopleFilter={selectedPersons} />
    </>
  );
};
