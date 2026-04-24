import { useAppStore } from '@/store/AppContext';
import { CategoryColumn } from './CategoryColumn';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { ItemCard } from './ItemCard';
import { Item, Category } from '@/types';

interface BoardProps {
  searchQuery?: string;
  peopleFilter?: string[];
}

export const Board = ({ searchQuery = '', peopleFilter = [] }: BoardProps) => {
  const { categories, setCategories, moveItem } = useAppStore();
  const [activeItem, setActiveItem] = useState<{ item: Item, categoryId: string } | null>(null);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           cat.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPerson = peopleFilter.length === 0 || peopleFilter.includes(item.person);
      return matchesSearch && matchesPerson;
    })
  })).filter(cat => cat.items.length > 0 || (searchQuery === '' && peopleFilter.length === 0));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { item, categoryId } = active.data.current as { item: Item, categoryId: string };
    setActiveItem({ item, categoryId });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const activeCategoryIndex = categories.findIndex(c => c.id === activeData?.categoryId);
    const activeCategory = categories[activeCategoryIndex];
    if (!activeCategory) return;

    const overCategoryIndex = categories.findIndex(c => c.id === (overData?.type === 'Category' ? over.id : overData?.categoryId));
    const overCategory = categories[overCategoryIndex];
    if (!overCategory) return;

    if (activeCategory.id !== overCategory.id) {
      moveItem(activeId as string, overCategory.id);
      setCategories((prev: Category[]) => {
        const newCats = [...prev];
        const aCatIdx = newCats.findIndex(c => c.id === activeCategory.id);
        const oCatIdx = newCats.findIndex(c => c.id === overCategory.id);
        
        const aItems = [...newCats[aCatIdx].items];
        const oItems = [...newCats[oCatIdx].items];
        
        const activeItemIndex = aItems.findIndex(i => (i as Item).id === activeId);
        const [movedItem] = aItems.splice(activeItemIndex, 1);
        
        const overItemIndex = overData?.type === 'Item' ? oItems.findIndex(i => (i as Item).id === overId) : oItems.length;
        oItems.splice(overItemIndex >= 0 ? overItemIndex : oItems.length, 0, movedItem);

        newCats[aCatIdx] = { ...newCats[aCatIdx], items: aItems };
        newCats[oCatIdx] = { ...newCats[oCatIdx], items: oItems };
        
        // Update active internal data reference so further drags know it's in the new category
        if (active.data.current) active.data.current.categoryId = overCategory.id;

        return newCats;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const categoryId = activeData?.categoryId;
    const activeCategoryIndex = categories.findIndex(c => c.id === categoryId);
    
    if (activeCategoryIndex === -1) return;

    // Item within the same column being sorted
    if (activeData?.categoryId === overData?.categoryId) {
       setCategories((prev: Category[]) => {
         const newCats = [...prev];
         const cat = { ...newCats[activeCategoryIndex] };
         const oldIndex = cat.items.findIndex(i => (i as Item).id === activeId);
          const newIndex = cat.items.findIndex(i => (i as Item).id === overId);
         cat.items = arrayMove(cat.items, oldIndex, newIndex);
         newCats[activeCategoryIndex] = cat;
         return newCats;
       });
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-wrap md:flex-nowrap md:overflow-x-auto gap-6 w-full items-start pb-6 scrollbar-thin scrollbar-thumb-outline-variant hover:scrollbar-thumb-outline pt-2 px-1">
        {filteredCategories.map(category => (
          <CategoryColumn key={category.id} category={category} />
        ))}
      </div>
      
      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? (
          <div className="rotate-2 opacity-90 scale-105 pointer-events-none">
            <ItemCard item={activeItem.item} categoryId={activeItem.categoryId} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
