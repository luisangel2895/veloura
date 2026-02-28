"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { calculateCartTotals } from "@/store/cart-domain";
import type { CartItem, Product, Size } from "@/types/catalog";

interface CartStore {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  hasHydrated: boolean;
  lastAddedAt: number;
  setHasHydrated: (value: boolean) => void;
  addItem: (product: Product, size: Size) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

const emptyCartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  lastAddedAt: 0,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ...emptyCartState,
      hasHydrated: false,
      setHasHydrated: (value) => set(() => ({ hasHydrated: value })),
      addItem: (product, size) =>
        set((state) => {
          const id = `${product.slug}-${size}`;
          const existing = state.items.find((item) => item.id === id);

          if (existing) {
            return {
              ...calculateCartTotals(
                state.items.map((item) =>
                  item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
                ),
              ),
              lastAddedAt: Date.now(),
            };
          }

          const nextItem: CartItem = {
            id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.images[0],
            size,
            priceCents: product.priceCents,
            quantity: 1,
            palette: product.palette,
          };

          return {
            ...calculateCartTotals([...state.items, nextItem]),
            lastAddedAt: Date.now(),
          };
        }),
      removeItem: (id) =>
        set((state) => calculateCartTotals(state.items.filter((item) => item.id !== id))),
      updateQty: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            return calculateCartTotals(state.items.filter((item) => item.id !== id));
          }

          return calculateCartTotals(
            state.items.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
          );
        }),
      clearCart: () =>
        set((state) => ({
          ...emptyCartState,
          hasHydrated: state.hasHydrated,
        })),
    }),
    {
      name: "veloura-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
      }),
    },
  ),
);
