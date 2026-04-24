import { useAppStore } from '@/store/AppContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PlansView = () => {
  const { plans, addPlan, deletePlan, setCurrentPlanId, renamePlan, loading, initialLoading } = useAppStore();
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!newPlanTitle.trim()) return;
    const plan = await addPlan(newPlanTitle);
    if (plan) {
      setNewPlanTitle('');
      setIsCreating(false);
      handleSelectPlan(plan.id);
    }
  };

  const handleSelectPlan = (id: string) => {
    if (editingId) return; // Don't navigate while editing
    setCurrentPlanId(id);
    navigate(`/p/${id}`);
  };

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renamePlan(id, editTitle);
    }
    setEditingId(null);
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-[100]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-gutter animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-xl">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter">My Plans</h1>
          <p className="text-on-surface-variant font-medium mt-1">Select a villa trip or create a new one.</p>
        </div>
        
        {!isCreating ? (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">add_circle</span>
            New Plan
          </button>
        ) : (
          <div className="flex gap-2 w-full md:w-auto animate-in slide-in-from-right-4">
            <input 
              autoFocus
              className="flex-1 md:w-64 px-4 py-3 bg-surface-container border border-primary rounded-2xl outline-none shadow-inner"
              placeholder="Summer Villa 2024..."
              value={newPlanTitle}
              onChange={e => setNewPlanTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button 
              onClick={handleCreate}
              className="bg-primary text-on-primary p-3 rounded-2xl"
            >
              <span className="material-symbols-outlined">check</span>
            </button>
            <button 
              onClick={() => setIsCreating(false)}
              className="bg-surface-container-high p-3 rounded-2xl"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {plans.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-4 border-dashed border-outline-variant/20 rounded-3xl opacity-50">
            <span className="material-symbols-outlined text-[64px] mb-4">maps_home_work</span>
            <p className="text-xl font-bold">No plans yet. Create your first one!</p>
          </div>
        ) : (
          plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className="group relative bg-surface-container-lowest border border-outline-variant p-6 rounded-3xl hover:border-primary hover:shadow-xl transition-all cursor-pointer flex justify-between items-center"
            >
              <div>
                {editingId === plan.id ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input 
                      autoFocus
                      className="bg-surface-container-high border-2 border-primary px-3 py-1.5 rounded-xl font-bold outline-none text-lg"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(plan.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => handleRename(plan.id)}
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{plan.title}</h3>
                    <p className="text-xs text-on-surface-variant font-mono mt-1 opacity-60 uppercase tracking-widest">
                      ID: {plan.id.slice(0, 8)}...
                    </p>
                  </>
                )}
                <p className="text-[10px] text-on-surface-variant mt-3 flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(plan.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(plan.id);
                    setEditTitle(plan.title);
                  }}
                  className="p-3 rounded-xl hover:bg-primary/10 text-on-surface-variant hover:text-primary"
                  title="Rename Plan"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('Delete this entire plan?')) deletePlan(plan.id);
                  }}
                  className="p-3 rounded-xl hover:bg-error/10 text-on-surface-variant hover:text-error"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
                <div className="bg-primary/10 text-primary p-3 rounded-xl">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
