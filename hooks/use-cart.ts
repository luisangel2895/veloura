"use client";

import { useShallow } from "zustand/react/shallow";

import { useCartStore } from "@/store/cart-store";

/**
 * Exposes cart state and actions from the global store.
 */
export function useCart<T>(selector: (state: ReturnType<typeof useCartStore.getState>) => T) {
  return useCartStore(useShallow(selector));
}
