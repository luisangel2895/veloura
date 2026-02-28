import type { CartItem } from "@/types/catalog";

export interface CartTotals {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return {
    items,
    totalItems,
    subtotal,
  };
}
