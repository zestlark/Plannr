export type UnitType = 'pcs' | 'kg' | 'ltr' | 'pack' | 'gm';

export interface Item {
  id: string;
  name: string;
  qty: number;
  unit: UnitType;
  person: string;
  price: number;
}

export interface Category {
  id: string;
  title: string;
  items: Item[];
}

export interface AppState {
  persons: string[];
  categories: Category[];
}

export interface DragItem {
  id: string;
  type: 'Item' | 'Category';
}
