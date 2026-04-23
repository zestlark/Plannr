import { useState } from 'react';
import { useAppStore } from '@/store/AppContext';
import { Users, Plus, X } from 'lucide-react';

export const PeopleManager = () => {
  const { persons, addPerson, removePerson } = useAppStore();
  const [val, setVal] = useState('');

  const handleAdd = () => {
    addPerson(val);
    setVal('');
  };

  return (
    <div className="flex flex-col flex-1 min-w-[280px] bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Users size={16} /> People
      </h3>
      <div className="flex gap-2 mb-3">
        <input
          className="input-focus flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm transition-all"
          placeholder="Enter name"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary px-3 py-2" onClick={handleAdd}>
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {persons.map(p => (
          <div key={p} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold group cursor-pointer transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
               onClick={() => removePerson(p)}>
            {p} 
            <span className="opacity-50 group-hover:opacity-100"><X size={12}/></span>
          </div>
        ))}
      </div>
    </div>
  );
};
