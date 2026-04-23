import { useState } from 'react';
import { useAppStore } from '@/store/AppContext';

export const PeopleManager = () => {
  const { persons, addPerson, removePerson } = useAppStore();
  const [val, setVal] = useState('');

  const handleAdd = () => {
    addPerson(val);
    setVal('');
  };

  return (
    <div className="flex flex-col flex-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <h3 className="font-h2 text-h2 text-on-surface mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-primary">group</span> People
      </h3>
      <p className="font-body-sm text-on-surface-variant mb-6">Add people to your group to assign them easily to shopping items.</p>
      
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          placeholder="Enter name"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
          className="flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-button hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50" 
          onClick={handleAdd}
          disabled={!val.trim()}
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span> Add
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {persons.map(p => (
          <div key={p} className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-[8px] font-body-md group cursor-pointer transition-colors hover:bg-error hover:text-on-error shadow-sm"
               onClick={() => removePerson(p)}>
            {p} 
            <span className="material-symbols-outlined text-[16px] opacity-70 group-hover:opacity-100">close</span>
          </div>
        ))}
      </div>
    </div>
  );
};
