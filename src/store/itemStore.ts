import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Item {
  id: string;
  text: string;
  createdDate: Date;
}

interface ItemState {
  items: Item[];
  addItem: (item: Item) => void;
  getAllItems: () => Item[];
  hasInitiallyLoaded: boolean;
  setHasInitiallyLoaded: (loaded: boolean) => void;
}

export const useItemStore = create<ItemState>()(
  persist(
    (set, get) => ({
      items: [],
      hasInitiallyLoaded: false,
      addItem: (item) => {
        set((state) => ({
          items: [...state.items, {
            ...item,
            createdDate: new Date(item.createdDate) // Ensure date is properly instantiated
          }]
        }));
      },
      getAllItems: () => {
        const state = get();
        return state.items.map(item => ({
          ...item,
          createdDate: new Date(item.createdDate) // Convert stored dates back to Date objects
        }));
      },
      setHasInitiallyLoaded: (loaded) => set({ hasInitiallyLoaded: loaded })
    }),
    {
      name: 'item-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
      onRehydrateStorage: () => (state) => {
        // Convert dates back to Date objects after rehydration
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