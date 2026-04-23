import { Category, UnitType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const UNITS: UnitType[] = ['pcs', 'kg', 'ltr', 'pack', 'gm'];

export const STORAGE_KEYS = {
  APP_STATE: 'villaShopping_react_v1',
};

export const INITIAL_PERSONS = ['Deepak'];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: uuidv4(),
    title: 'Mumbai',
    items: [],
  },
  {
    id: uuidv4(),
    title: 'Pune',
    items: [],
  },
  {
    id: uuidv4(),
    title: 'Villa',
    items: [],
  }
];
