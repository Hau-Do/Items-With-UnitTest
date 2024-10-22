import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Item {
  id: string;
  text: string;
  createdDate: Date;
}

export type SortOrder = 'asc' | 'desc';

interface ItemState {
  items: Item[];
  sortOrder: SortOrder;
  addItem: (item: Item) => void;
  getAllItems: () => Item[];
  setSortOrder: (order: SortOrder) => void;
  hasInitiallyLoaded: boolean;
  setHasInitiallyLoaded: (loaded: boolean) => void;
}

const sortItems = (items: Item[], sortOrder: SortOrder): Item[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export const useItemStore = create<ItemState>()(
  persist(
    (set, get) => ({
      items: [],
      sortOrder: 'desc' as SortOrder, // Default sort order
      hasInitiallyLoaded: false,

      addItem: (item) => {
        set((state) => {
          const newItem = {
            ...item,
            createdDate: new Date(item.createdDate)
          };
          const newItems = [...state.items, newItem];
          return {
            items: sortItems(newItems, state.sortOrder)
          };
        });
      },

      getAllItems: () => {
        const state = get();
        const itemsWithDates = state.items.map(item => ({
          ...item,
          createdDate: new Date(item.createdDate)
        }));
        return sortItems(itemsWithDates, state.sortOrder);
      },

      setSortOrder: (order: SortOrder) => {
        set((state) => ({
          sortOrder: order,
          items: sortItems(state.items, order)
        }));
      },

      setHasInitiallyLoaded: (loaded) => set({ hasInitiallyLoaded: loaded })
    }),
    {
      name: 'item-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items,
        sortOrder: state.sortOrder // Persist sort order
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          state.items = state.items.map(item => ({
            ...item,
            createdDate: new Date(item.createdDate)
          }));
        }
      }
    }
  )
);