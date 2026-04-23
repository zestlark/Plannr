import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Item, UnitType } from '@/types';
import { STORAGE_KEYS, INITIAL_PERSONS, INITIAL_CATEGORIES } from '@/constants';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface AppContextProps {
  persons: string[];
  categories: Category[];
  addPerson: (name: string) => void;
  removePerson: (name: string) => void;
  addCategory: (title: string) => void;
  renameCategory: (id: string, newTitle: string) => void;
  addItem: (categoryId: string, name: string) => void;
  deleteItem: (categoryId: string, itemId: string) => void;
  updateItem: (categoryId: string, itemId: string, updates: Partial<Item>) => void;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  exportData: () => string;
  importData: (jsonStr: string) => void;
  sortAllItems: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [persons, setPersons] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const sanitizeData = (data: any): { persons: string[], categories: Category[] } => {
    const persons = Array.isArray(data.persons) ? data.persons : INITIAL_PERSONS;
    const rawCategories = Array.isArray(data.categories) ? data.categories : INITIAL_CATEGORIES;

    const categories = rawCategories.map((c: any) => ({
      id: c.id || uuidv4(),
      title: c.title || 'Untitled Category',
      items: (Array.isArray(c.items) ? c.items : []).map((i: any) => ({
        id: i.id || uuidv4(),
        name: i.name || 'Untitled Item',
        qty: typeof i.qty === 'string' ? (parseFloat(i.qty.trim()) || 0) : (parseFloat(i.qty) || 0),
        unit: (i.unit as UnitType) || 'pcs',
        person: i.person || '',
        price: typeof i.price === 'string' ? (parseFloat(i.price.trim()) || 0) : (parseFloat(i.price) || 0)
      }))
    }));

    return { persons, categories };
  };

  // Load from local storage
  useEffect(() => {
    try {
      const persisted = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (persisted) {
        const data = JSON.parse(persisted);
        const { persons, categories } = sanitizeData(data);
        setPersons(persons);
        setCategories(categories);
      } else {
        // Fallback to older vanilla JS localstorage if exists
        const oldPersons = localStorage.getItem('persons');
        const oldCategories = localStorage.getItem('villaShopping');
        if (oldPersons || oldCategories) {
          const parsedOldPersons = oldPersons ? JSON.parse(oldPersons) : INITIAL_PERSONS;
          const parsedOldCats = oldCategories ? JSON.parse(oldCategories) : [];
          
          const { persons, categories } = sanitizeData({ 
            persons: parsedOldPersons, 
            categories: parsedOldCats 
          });
          
          setPersons(persons);
          setCategories(categories.length ? categories : INITIAL_CATEGORIES);
        } else {
          setPersons(INITIAL_PERSONS);
          setCategories(INITIAL_CATEGORIES);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setPersons(INITIAL_PERSONS);
      setCategories(INITIAL_CATEGORIES);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage automatically
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify({ persons, categories }));
    }
  }, [persons, categories, isLoaded]);

  const addPerson = (name: string) => {
    if (!name.trim() || persons.includes(name.trim())) return;
    setPersons(prev => [...prev, name.trim()]);
    toast.success('Person Added');
  };

  const removePerson = (name: string) => {
    setPersons(prev => prev.filter(p => p !== name));
    // Also change instances in items
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => item.person === name ? { ...item, person: '' } : item)
    })));
    toast.success('Person Removed');
  };

  const addCategory = (title: string) => {
    if (!title.trim()) return;
    setCategories(prev => [...prev, { id: uuidv4(), title: title.trim(), items: [] }]);
    toast.success('Category Added');
  };

  const renameCategory = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c));
    toast.success('Category Renamed');
  };

  const addItem = (categoryId: string, name: string) => {
    if (!name.trim()) return;
    setCategories(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      const newItem: Item = { id: uuidv4(), name: name.trim(), qty: 1, unit: 'pcs', person: '', price: 0 };
      return { ...c, items: [...c.items, newItem] };
    }));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      return { ...c, items: c.items.filter(i => i.id !== itemId) };
    }));
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<Item>) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      return {
        ...c,
        items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
      };
    }));
  };

  const exportData = () => {
    const data = JSON.stringify({ persons, categories }, null, 2);
    return data;
  };

  const importData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      const { persons: newPersons, categories: newCategories } = sanitizeData(data);
      
      setPersons(newPersons);
      setCategories(newCategories);
      
      toast.success('Imported Successfully');
    } catch {
      toast.error('Invalid JSON format');
    }
  };

  const sortAllItems = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: [...cat.items].sort((a, b) => {
        const personA = a.person || 'Unassigned';
        const personB = b.person || 'Unassigned';
        if (personA !== personB) return personA.localeCompare(personB);
        return a.name.localeCompare(b.name);
      })
    })));
    toast.success('Sorted A-Z by Person');
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{
      persons, categories, addPerson, removePerson, addCategory, renameCategory,
      addItem, deleteItem, updateItem, setCategories, exportData, importData, sortAllItems
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
