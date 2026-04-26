import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Item, UnitType } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Plan {
  id: string;
  title: string;
  created_at: string;
}

interface AppContextProps {
  plans: Plan[];
  persons: string[];
  categories: Category[];
  loading: boolean;
  initialLoading: boolean;
  activePlan: Plan | null;
  currentPlanId: string | null;
  setCurrentPlanId: (id: string | null) => void;
  // Plan CRUD
  addPlan: (title: string) => Promise<Plan | null>;
  deletePlan: (id: string) => Promise<void>;
  renamePlan: (id: string, newTitle: string) => Promise<void>;
  exportData: () => string;
  importData: (jsonStr: string) => void;
  // Data CRUD
  addPerson: (name: string) => Promise<void>;
  removePerson: (name: string) => Promise<void>;
  addCategory: (title: string) => Promise<void>;
  renameCategory: (id: string, newTitle: string) => Promise<void>;
  addItem: (categoryId: string, name: string, unit?: UnitType) => Promise<void>;
  deleteItem: (categoryId: string, itemId: string) => Promise<void>;
  updateItem: (categoryId: string, itemId: string, updates: Partial<Item>) => Promise<void>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  moveItem: (itemId: string, newCategoryId: string) => Promise<void>;
  sortAllItems: () => void;
  copyCategoryToClipboard: (id: string) => void;
  deleteCategory: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [persons, setPersons] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const activePlan = plans.find(p => p.id === currentPlanId) || null;

  // Initial Fetch: Plans
  useEffect(() => {
    const init = async () => {
      await fetchPlans();
      setInitialLoading(false);
    };
    init();
    
    // Realtime for plans
    const planSub = supabase
      .channel('plans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => fetchPlans())
      .subscribe();

    return () => {
      supabase.removeChannel(planSub);
    };
  }, []);

  // Fetch Data when currentPlanId changes
  useEffect(() => {
    if (currentPlanId) {
      fetchData();

      const dataSub = supabase
        .channel(`plan-data-${currentPlanId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => fetchData(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'persons' }, () => fetchData(true))
        .subscribe();

      return () => {
        supabase.removeChannel(dataSub);
      };
    } else {
      setPersons([]);
      setCategories([]);
      // We don't set initialLoading to false here because fetchPlans might still be running
      // and PlansView needs to know if it's done.
    }
  }, [currentPlanId]);

  const fetchPlans = async () => {
    const { data } = await supabase.from('plans').select('*').order('created_at', { ascending: false });
    setPlans(data || []);
  };

  const fetchData = async (silent = false) => {
    if (!currentPlanId) return;
    if (!silent) setLoading(true);
    try {
      const { data: personsData } = await supabase
        .from('persons')
        .select('name')
        .eq('plan_id', currentPlanId);
      
      setPersons(personsData?.map(p => p.name) || []);

      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          id,
          title,
          items (
            id,
            name,
            qty,
            unit,
            person,
            price
          )
        `)
        .eq('plan_id', currentPlanId)
        .order('order', { ascending: true });

      setCategories((categoriesData as unknown as Category[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const addPlan = async (title: string) => {
    const { data, error } = await supabase
      .from('plans')
      .insert([{ title: title.trim() }])
      .select()
      .single();
    
    if (error) {
      toast.error('Error creating plan');
      return null;
    }
    toast.success('Plan Created');
    return data as Plan;
  };

  const deletePlan = async (id: string) => {
    const backup = [...plans];
    setPlans(prev => prev.filter(p => p.id !== id));

    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) {
      setPlans(backup);
      toast.error('Error deleting plan');
      console.error('Delete error:', error);
    } else {
      toast.success('Plan Deleted');
      if (currentPlanId === id) {
        setCurrentPlanId(null);
        setCategories([]);
        setPersons([]);
      }
    }
  };

  const renamePlan = async (id: string, newTitle: string) => {
    const backup = [...plans];
    setPlans(prev => prev.map(p => p.id === id ? { ...p, title: newTitle.trim() } : p));

    const { error } = await supabase.from('plans').update({ title: newTitle.trim() }).eq('id', id);
    if (error) {
      setPlans(backup);
      toast.error('Failed to rename plan');
    } else {
      toast.success('Plan renamed');
    }
  };

  const exportData = () => {
    return JSON.stringify({ persons, categories }, null, 2);
  };

  const importData = async (jsonStr: string) => {
    if (!currentPlanId) return;
    try {
      const data = JSON.parse(jsonStr);
      setLoading(true);

      // 1. Import Persons (handle both 'persons' and 'people' key names)
      const personsArray = data.persons || data.people;
      if (personsArray && Array.isArray(personsArray)) {
        // Clear existing persons to avoid unique constraint issues
        await supabase.from('persons').delete().eq('plan_id', currentPlanId);
        
        const personsToInsert = personsArray.map((name: string) => ({
          name: name.trim(),
          plan_id: currentPlanId
        })).filter(p => p.name); // Avoid empty names

        if (personsToInsert.length > 0) {
          const { error: pError } = await supabase.from('persons').insert(personsToInsert);
          if (pError) console.error('Error importing persons:', pError);
        }
      }

      // 2. Import Categories & Items
      if (data.categories && Array.isArray(data.categories)) {
        for (const cat of data.categories) {
          // Upsert Category
          const { error: catError } = await supabase.from('categories').upsert([{
            id: cat.id,
            title: cat.title,
            plan_id: currentPlanId
          }]);

          if (catError) {
            console.error('Error importing category:', cat.title, catError);
            continue;
          }

          // Upsert Items for this category
          if (cat.items && Array.isArray(cat.items)) {
            const itemsToInsert = cat.items.map((item: any) => ({
              id: item.id,
              category_id: cat.id,
              name: item.name,
              qty: item.qty || 1,
              unit: item.unit || 'pcs',
              person: item.person || '',
              price: item.price || 0
            }));
            const { error: itemsError } = await supabase.from('items').upsert(itemsToInsert);
            if (itemsError) console.error('Error importing items for:', cat.title, itemsError);
          }
        }
      }

      toast.success('Data Sync Success!');
      await fetchData(true);
    } catch (e) {
      console.error('Import error:', e);
      toast.error('Invalid JSON or Sync Error');
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async (name: string) => {
    if (!currentPlanId || !name.trim() || persons.includes(name.trim())) return;
    const backup = [...persons];
    const trimmed = name.trim();
    setPersons(prev => [...prev, trimmed]);

    const { error } = await supabase.from('persons').insert([{ name: trimmed, plan_id: currentPlanId }]);
    if (error) {
      setPersons(backup);
      toast.error('Failed to add person');
    }
  };

  const removePerson = async (name: string) => {
    if (!currentPlanId) return;
    const backup = [...persons];
    setPersons(prev => prev.filter(p => p !== name));

    const { error } = await supabase.from('persons').delete().eq('name', name).eq('plan_id', currentPlanId);
    if (error) {
      setPersons(backup);
      toast.error('Failed to remove person');
    }
  };

  const addCategory = async (title: string) => {
    if (!currentPlanId || !title.trim()) return;
    // We can't easily predict the ID of the new category before Supabase returns it,
    // so we call Supabase and update state. Since adding a category is less frequent than item updates,
    // we just await it or use a temporary local ID.
    await supabase.from('categories').insert([{ 
      title: title.trim(), 
      plan_id: currentPlanId,
      order: categories.length 
    }]);
  };

  const renameCategory = async (id: string, newTitle: string) => {
    const backup = [...categories];
    setCategories(prev => prev.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c));

    const { error } = await supabase.from('categories').update({ title: newTitle.trim() }).eq('id', id);
    if (error) {
      setCategories(backup);
      toast.error('Failed to rename category');
    }
  };

  const addItem = async (categoryId: string, name: string, unit: UnitType = 'pcs') => {
    // Adding items also needs an ID from Supabase, but we can call it.
    await supabase.from('items').insert([{ category_id: categoryId, name: name.trim(), unit, qty: 1 }]);
  };

  const deleteItem = async (categoryId: string, itemId: string) => {
    const backup = [...categories];
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } 
        : cat
    ));

    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) {
      setCategories(backup);
      toast.error('Delete failed');
    }
  };

  const updateItem = async (categoryId: string, itemId: string, updates: Partial<Item>) => {
    const backup = [...categories];
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: cat.items.map(i => i.id === itemId ? { ...i, ...updates } : i) } 
        : cat
    ));

    const { error } = await supabase.from('items').update(updates).eq('id', itemId);
    if (error) {
      setCategories(backup);
      toast.error('Update failed');
    }
  };

  const moveItem = async (itemId: string, newCategoryId: string) => {
    const backup = [...categories];
    // This logic is complex for optimistic update as it involves moving across arrays.
    // Board.tsx already handles the local state update via setCategories before calling moveItem.
    // So we just call Supabase here.
    const { error } = await supabase.from('items').update({ category_id: newCategoryId }).eq('id', itemId);
    if (error) {
      setCategories(backup);
      toast.error('Move failed');
    }
  };

  const sortAllItems = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: [...cat.items].sort((a, b) => {
        const pA = a.person || 'Unassigned';
        const pB = b.person || 'Unassigned';
        if (pA !== pB) return pA.localeCompare(pB);
        return a.name.localeCompare(b.name);
      })
    })));
  };

  const copyCategoryToClipboard = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const sortedItems = [...cat.items].sort((a, b) => {
      const pA = a.person || 'Unassigned';
      const pB = b.person || 'Unassigned';
      if (pA !== pB) return pA.localeCompare(pB);
      return a.name.localeCompare(b.name);
    });

    let summary = `🛒 📍 *${cat.title}*\n\n`;
    const byPerson: Record<string, Item[]> = {};
    sortedItems.forEach(i => {
      const p = i.person || 'Unassigned';
      if (!byPerson[p]) byPerson[p] = [];
      byPerson[p].push(i);
    });

    Object.keys(byPerson).sort().forEach((person, idx, arr) => {
      summary += `*${person}*\n`;
      byPerson[person].forEach(item => summary += `• ${item.name} - ${item.qty} ${item.unit}\n`);
      if (idx < arr.length - 1) summary += `\n-------\n`;
    });

    navigator.clipboard.writeText(summary.trim());
    toast.success('Category List Copied!');
  };

  const deleteCategory = async (id: string) => {
    const backup = [...categories];
    setCategories(prev => prev.filter(c => c.id !== id));

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      setCategories(backup);
      toast.error('Failed to delete category');
    }
  };

  return (
    <AppContext.Provider value={{
      plans, persons, categories, loading, initialLoading, activePlan, currentPlanId, setCurrentPlanId,
      addPlan, deletePlan, renamePlan, addPerson, removePerson, addCategory, renameCategory,
      addItem, deleteItem, updateItem, sortAllItems, setCategories, moveItem,
      exportData, importData, copyCategoryToClipboard, deleteCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
