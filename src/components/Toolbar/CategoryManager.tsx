import { useState } from 'react';
import { useAppStore } from '@/store/AppContext';
import { FolderPlus, Plus } from 'lucide-react';

export const CategoryManager = () => {
  const { addCategory } = useAppStore();
  const [val, setVal] = useState('');

  const handleAdd = () => {
    addCategory(val);
    setVal('');
  };

  return (
    <div className="flex flex-col flex-1 min-w-[280px] bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <FolderPlus size={16} /> Categories
      </h3>
      <div className="flex gap-2">
        <input
          className="input-focus flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm transition-all"
          placeholder="Enter category name"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary px-3 py-2" onClick={handleAdd}>
          <Plus size={16} /> Add
        </button>
      </div>
    </div>
  );
};
