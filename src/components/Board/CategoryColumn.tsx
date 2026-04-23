import { useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Category } from '@/types';
import { useAppStore } from '@/store/AppContext';
import { ItemCard } from './ItemCard';
import { Edit2, Copy, Plus } from 'lucide-react';
import { generateWhatsAppSummary, copyToClipboard } from '@/utils';

interface Props {
  category: Category;
}

export const CategoryColumn = ({ category }: Props) => {
  const { renameCategory, addItem, categories } = useAppStore();
  const [val, setVal] = useState('');

  const itemIds = useMemo(() => category.items.map(i => i.id), [category.items]);

  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
    data: { type: 'Category', category }
  });

  const handleAdd = () => {
    addItem(category.id, val);
    setVal('');
  };

  const handleRename = () => {
    const newTitle = prompt('Rename Category', category.title);
    if (newTitle) renameCategory(category.id, newTitle);
  };

  const handleCopyCategory = () => {
    // Generate only for this category
    const singleCatList = [categories.find(c => c.id === category.id)!];
    const text = generateWhatsAppSummary(singleCatList);
    copyToClipboard(text, "Category List Copied!");
  };

  return (
    <div className="flex flex-col min-w-[340px] flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          {category.title}
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{category.items.length}</span>
        </h2>
        <div className="flex gap-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button 
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            onClick={handleRename}
            title="Rename Category"
          >
            <Edit2 size={16} />
          </button>
          <div className="w-[1px] bg-slate-200 dark:bg-slate-700" />
          <button 
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-success transition-colors"
            onClick={handleCopyCategory}
            title="Copy List for WhatsApp"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="input-focus flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm transition-all"
          placeholder="Add new item..."
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary px-3 py-2 bg-indigo-600 text-white shadow-sm" onClick={handleAdd}>
          <Plus size={16} /> Add
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 flex flex-col min-h-[100px] rounded-xl p-2 transition-all ${isOver ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900 border border-transparent'}`}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {category.items.map(item => (
            <ItemCard key={item.id} item={item} categoryId={category.id} />
          ))}
        </SortableContext>
        {category.items.length === 0 && !isOver && (
          <div className="opacity-50 text-center text-sm font-medium py-8 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            Empty List. Add or drop items here.
          </div>
        )}
      </div>
    </div>
  );
};
