"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ProductSort, Size } from "@/types/catalog";

type FilterSize = Size | "all";

interface FilterState {
  size: FilterSize;
  category: string;
  sort: ProductSort;
}

interface FilterStore extends FilterState {
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
      setFilter: (key, value) => set(() => ({ [key]: value } as Pick<FilterState, typeof key>)),
      clearFilters: () => set(() => ({ ...defaultFilters })),
    }),
    {
      name: "veloura-filters",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        size: state.size,
        category: state.category,
        sort: state.sort,
      }),
    },
  ),
);
