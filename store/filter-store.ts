"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductSort, Size } from "@/types/catalog";

export type FilterSize = Size | "all";

export interface FilterState {
  size: FilterSize;
  category: string;
  sort: ProductSort;
}

export interface FilterStore extends FilterState {
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
}

const defaultFilters: FilterState = {
  size: "all",
  category: "all",
  sort: "featured",
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...defaultFilters,

      setFilter: (key, value) =>
        set((state) => {
          // ✅ evita renders inútiles y loops
          if (state[key] === value) return state;
          return { ...state, [key]: value };
        }),

      clearFilters: () => set(() => ({ ...defaultFilters })),
    }),
    {
      name: "veloura-filters",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        size: state.size,
        category: state.category,
        sort: state.sort,
      }),
    },
  ),
);
