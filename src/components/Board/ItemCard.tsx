import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item, UnitType } from '@/types';
import { useAppStore } from '@/store/AppContext';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface Props {
  item: Item;
  categoryId: string;
}

const UNITS: UnitType[] = ['pcs', 'kg', 'ltr', 'pack', 'gm'];

export const ItemCard = ({ item, categoryId }: Props) => {
  const { deleteItem, updateItem, persons } = useAppStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQty, setEditQty] = useState(item.qty.toString());
  const [editPrice, setEditPrice] = useState(item.price?.toString() || '');

  useEffect(() => {
    setEditQty(item.qty.toString());
  }, [item.qty]);

  useEffect(() => {
    setEditName(item.name);
  }, [item.name]);

  useEffect(() => {
    setEditPrice(item.price?.toString() || '');
  }, [item.price]);

  // Debounced Price Sync
  useEffect(() => {
    const val = Number(editPrice);
    if (!isNaN(val) && val !== item.price) {
      const timer = setTimeout(() => {
        updateItem(categoryId, item.id, { price: val });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [editPrice, categoryId, item.id, item.price]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'Item', item, categoryId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleUpdateQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    const step = ['kg', 'ltr', 'gm'].includes(item.unit) ? 0.5 : 1;
    const newVal = Math.max(0, item.qty + (delta * step));
    updateItem(categoryId, item.id, { qty: newVal });
  };

  const handleManualQtySave = () => {
    const val = parseFloat(editQty);
    if (!isNaN(val)) {
      updateItem(categoryId, item.id, { qty: Math.max(0, val) });
    }
    setIsEditingQty(false);
  };

  const saveName = () => {
    if (editName.trim()) {
      updateItem(categoryId, item.id, { name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const setUnit = (u: UnitType) => {
    updateItem(categoryId, item.id, { unit: u });
  };

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateItem(categoryId, item.id, { person: e.target.value });
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={clsx(
        "group/item bg-surface-container-lowest p-3 rounded-xl transition-all duration-200 flex flex-col gap-2 relative border border-transparent shadow-sm",
        isDragging ? "shadow-2xl ring-2 ring-primary border-primary" : "hover:shadow-md hover:border-outline-variant"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div 
            {...attributes} 
            {...listeners} 
            className="mt-1 p-1 -m-1 cursor-grab active:cursor-grabbing text-on-surface-variant/30 hover:text-primary transition-colors flex shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <input
                autoFocus
                className="w-full px-2 py-0.5 bg-surface-container-low border border-primary rounded-md text-sm outline-none"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => e.key === 'Enter' && saveName()}
              />
            ) : (
              <span 
                className="font-medium text-on-surface truncate block cursor-pointer hover:text-primary transition-colors py-0.5"
                onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}
              >
                {item.name}
              </span>
            )}
          </div>
        </div>

        <button 
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); deleteItem(categoryId, item.id); }}
          className="opacity-0 group-hover/item:opacity-100 p-1 text-on-surface-variant hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
          title="Delete Item"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        <div className="flex items-center justify-between gap-3">
          {/* Quantity and +/- buttons */}
          <div className="flex items-center gap-1 bg-surface-container-low px-1 py-1 rounded-lg border border-outline-variant/30 shadow-inner">
            <button 
              onPointerDown={e => e.stopPropagation()}
              onClick={(e) => handleUpdateQty(e, -1)} 
              className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            
            <div className="flex items-center gap-1 min-w-[50px] justify-center bg-surface-container-lowest/90 rounded-md px-2 py-1 border border-outline-variant/10 shadow-sm">
              {isEditingQty ? (
                <input
                  autoFocus
                  type="text"
                  className="w-8 text-center bg-transparent border-none outline-none font-bold text-sm"
                  value={editQty}
                  onChange={e => setEditQty(e.target.value)}
                  onBlur={handleManualQtySave}
                  onKeyDown={e => e.key === 'Enter' && handleManualQtySave()}
                />
              ) : (
                <span 
                  className="font-bold text-on-surface text-sm cursor-pointer hover:text-primary transition-colors flex items-center gap-0.5"
                  onClick={(e) => { e.stopPropagation(); setIsEditingQty(true); }}
                >
                  {item.qty}
                </span>
              )}
            </div>
            
            <button 
              onPointerDown={e => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleUpdateQty(e, 1); }} 
              className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Price Input */}
            <div className="flex items-center text-on-surface-variant font-medium bg-surface-container-low px-2 py-1 rounded-lg border border-outline-variant/30 hover:border-primary/30 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary shadow-inner">
              <span className="text-[10px] mr-1 opacity-60 font-bold">₹</span>
              <input
                type="number"
                step="any"
                value={editPrice}
                onPointerDown={e => e.stopPropagation()}
                onChange={e => setEditPrice(e.target.value)}
                className="w-12 bg-transparent outline-none text-right hide-arrows text-sm font-bold text-on-surface"
                placeholder="0"
              />
            </div>

            {/* Assignee Circle */}
            <div className="relative group/assignee shrink-0">
              <div 
                className={clsx(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all border shadow-sm",
                  item.person ? "bg-primary border-primary text-on-primary ring-2 ring-primary/10 shadow-md" : "bg-surface-container-low border-outline-variant/30 text-on-surface-variant/40 hover:border-primary hover:bg-surface-container"
                )}
              >
                {item.person ? (
                  <span className="text-[10px] font-black uppercase tracking-tighter">{item.person.slice(0, 2)}</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                )}
              </div>
              <select 
                value={item.person || ''}
                onPointerDown={e => e.stopPropagation()}
                onChange={handlePersonChange}
                title={item.person || 'Unassigned'}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
              >
                <option value="">Unassigned</option>
                {persons.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Measurement Selection & Total Price */}
        <div className="flex items-center justify-between gap-1.5 mt-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
             <span className="text-[10px] uppercase font-bold text-on-surface-variant/40 shrink-0">Unit:</span>
             <div className="relative group/unit shrink-0">
                <div className="bg-surface-container border border-outline-variant/30 px-2 py-0.5 rounded-md text-[11px] font-black uppercase text-primary flex items-center gap-0.5">
                  {item.unit}
                  <span className="material-symbols-outlined text-[14px] opacity-50">expand_more</span>
                </div>
                <select 
                  value={item.unit}
                  onPointerDown={e => e.stopPropagation()}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u.toUpperCase()}</option>
                  ))}
                </select>
             </div>
          </div>
          
          <div className="bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
            <span className="text-[11px] font-black text-primary uppercase tracking-tight whitespace-nowrap">
              Total: ₹{(item.qty * (item.price || 0)).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
