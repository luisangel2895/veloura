"use client";

import { useEffect } from "react";

import { useFilterStore } from "@/store/filter-store";
import { useCartStore } from "@/store/cart-store";

export function StoreHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useFilterStore.persist.rehydrate();
  }, []);

  return null;
}
