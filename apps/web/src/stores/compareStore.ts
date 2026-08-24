import { create } from 'zustand';
import { Property } from '../types';

interface CompareState {
  items: Property[];
  addItem: (property: Property) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: JSON.parse(localStorage.getItem('hms_compare') || '[]'),

  addItem: (property) => {
    const current = get().items;
    if (current.some(p => p.id === property.id)) return;
    if (current.length >= 4) {
      alert('You can compare a maximum of 4 properties at a time.');
      return;
    }
    const updated = [...current, property];
    localStorage.setItem('hms_compare', JSON.stringify(updated));
    set({ items: updated });
  },

  removeItem: (id) => {
    const updated = get().items.filter(p => p.id !== id);
    localStorage.setItem('hms_compare', JSON.stringify(updated));
    set({ items: updated });
  },

  clear: () => {
    localStorage.removeItem('hms_compare');
    set({ items: [] });
  }
}));
