import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item, UnitType } from '@/types';
import { useAppStore } from '@/store/AppContext';
import { UNITS } from '@/constants';
import { Trash2, GripVertical, Minus, Plus } from 'lucide-react';

interface Props {
  item: Item;
  categoryId: string;
}

export const ItemCard = ({ item, categoryId }: Props) => {
  const { updateItem, deleteItem, persons } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: 'Item', item, categoryId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleMinus = () => {
    const step = ['kg', 'ltr', 'gm'].includes(item.unit) ? 0.5 : 1;
    updateItem(categoryId, item.id, { qty: Math.max(0, item.qty - step) });
  };

  const handlePlus = () => {
    const step = ['kg', 'ltr', 'gm'].includes(item.unit) ? 0.5 : 1;
    updateItem(categoryId, item.id, { qty: item.qty + step });
  };

  const saveName = () => {
    if (editName.trim()) {
      updateItem(categoryId, item.id, { name: editName.trim() });
    } else {
      setEditName(item.name);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-slate-800 border ${isDragging ? 'border-primary' : 'border-slate-200 dark:border-slate-700'} p-4 rounded-xl shadow-sm hover:shadow-md transition-all mb-3 flex flex-col gap-3`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div 
            {...attributes} 
            {...listeners} 
            className="mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <input
                autoFocus
                className="input-focus w-full px-2 py-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => e.key === 'Enter' && saveName()}
              />
            ) : (
              <div 
                className="font-semibold text-slate-800 dark:text-slate-100 cursor-text hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                onDoubleClick={() => setIsEditing(true)}
              >
                {item.name}
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => deleteItem(categoryId, item.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Price Input */}
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus-within:border-indigo-500 transition-colors px-2 py-1">
          <span className="text-slate-400 text-sm">₹</span>
          <input
            type="number"
            min="0"
            className="w-14 bg-transparent border-none text-sm outline-none px-1 text-slate-700 dark:text-slate-200"
            value={item.price || ''}
            onChange={e => updateItem(categoryId, item.id, { price: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        {/* Qty Controls */}
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-8">
          <button 
            className="bg-slate-100 dark:bg-slate-800 px-2 h-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={handleMinus}
          >
            <Minus size={14} />
          </button>
          <div className="min-w-[40px] text-center text-sm font-medium bg-slate-50 dark:bg-slate-900 h-full flex items-center justify-center text-slate-800 dark:text-slate-200">
            {item.qty}
          </div>
          <button 
            className="bg-slate-100 dark:bg-slate-800 px-2 h-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={handlePlus}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Unit Select */}
        <select
          className="input-focus h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm px-2 text-slate-700 dark:text-slate-200"
          value={item.unit}
          onChange={e => updateItem(categoryId, item.id, { unit: e.target.value as UnitType })}
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        {/* Person Select */}
        <select
          className="input-focus h-8 flex-1 min-w-[100px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm px-2 text-slate-700 dark:text-slate-200"
          value={item.person || ''}
          onChange={e => updateItem(categoryId, item.id, { person: e.target.value })}
        >
          <option value="">Unassigned</option>
          {persons.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
};
