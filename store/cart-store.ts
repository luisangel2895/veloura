"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, Product, Size } from "@/types/catalog";

interface CartStore {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, size: Size) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
};

function withTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return {
    items,
    totalItems,
    subtotal,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ...initialState,
      addItem: (product, size) =>
        set((state) => {
          const id = `${product.slug}-${size}`;
          const existing = state.items.find((item) => item.id === id);

          if (existing) {
            return withTotals(
              state.items.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            );
          }

          const nextItem: CartItem = {
            id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            size,
            priceCents: product.priceCents,
            quantity: 1,
            palette: product.palette,
          };

          return withTotals([...state.items, nextItem]);
        }),
      removeItem: (id) =>
        set((state) => withTotals(state.items.filter((item) => item.id !== id))),
      updateQty: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            return withTotals(state.items.filter((item) => item.id !== id));
          }

          return withTotals(
            state.items.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
          );
        }),
      clearCart: () => set(() => ({ ...initialState })),
    }),
    {
      name: "veloura-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
      }),
    },
  ),
);
