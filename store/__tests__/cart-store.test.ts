import { describe, expect, it, beforeEach } from "vitest";

import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/catalog";

const mockProduct: Product = {
  id: "vel-001",
  slug: "noir-essence-balconette",
  name: "Noir Essence Balconette",
  tagline: "Timeless elegance redefined",
  description: "An elegant balconette bra",
  details: ["Hand-finished lace trim", "Adjustable straps"],
  priceCents: 11200,
  categorySlug: "balconette",
  images: ["/img/product1.jpg"],
  sizesAvailable: ["S", "M", "L"],
  variants: [
    { size: "S", inStock: true, label: "Small" },
    { size: "M", inStock: true, label: "Medium" },
    { size: "L", inStock: true, label: "Large" },
  ],
  tags: ["luxury", "new"],
  palette: ["#1b1a1e", "#7e6843"],
  featured: false,
};

const mockProduct2: Product = {
  id: "vel-002",
  slug: "cashmere-hush-bralette",
  name: "Cashmere Hush Bralette",
  tagline: "Soft beyond compare",
  description: "A soft bralette",
  details: ["Cashmere blend fabric"],
  priceCents: 8600,
  categorySlug: "lounge",
  images: ["/img/product2.jpg"],
  sizesAvailable: ["S", "M"],
  variants: [
    { size: "S", inStock: true, label: "Small" },
    { size: "M", inStock: true, label: "Medium" },
  ],
  tags: ["lounge"],
  palette: ["#2a2a2a", "#d4c5a9"],
  featured: false,
};

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      totalItems: 0,
      subtotal: 0,
      hasHydrated: false,
      lastAddedAt: 0,
    });
  });

  it("starts with an empty cart", () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.subtotal).toBe(0);
  });

  it("adds an item to the cart", () => {
    useCartStore.getState().addItem(mockProduct, "M");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe("Noir Essence Balconette");
    expect(state.items[0].size).toBe("M");
    expect(state.items[0].quantity).toBe(1);
    expect(state.totalItems).toBe(1);
    expect(state.subtotal).toBe(11200);
    expect(state.lastAddedAt).toBeGreaterThan(0);
  });

  it("increments quantity when adding same product + size", () => {
    useCartStore.getState().addItem(mockProduct, "M");
    useCartStore.getState().addItem(mockProduct, "M");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.totalItems).toBe(2);
    expect(state.subtotal).toBe(22400);
  });

  it("adds different sizes as separate items", () => {
    useCartStore.getState().addItem(mockProduct, "S");
    useCartStore.getState().addItem(mockProduct, "L");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.totalItems).toBe(2);
  });

  it("removes an item", () => {
    useCartStore.getState().addItem(mockProduct, "M");
    useCartStore.getState().addItem(mockProduct2, "S");
    useCartStore.getState().removeItem("noir-essence-balconette-M");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].slug).toBe("cashmere-hush-bralette");
  });

  it("updates quantity", () => {
    useCartStore.getState().addItem(mockProduct, "M");
    useCartStore.getState().updateQty("noir-essence-balconette-M", 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalItems).toBe(5);
    expect(state.subtotal).toBe(56000);
  });

  it("removes item when quantity is set to 0", () => {
    useCartStore.getState().addItem(mockProduct, "M");
    useCartStore.getState().updateQty("noir-essence-balconette-M", 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("clears the cart", () => {
    useCartStore.getState().addItem(mockProduct, "M");
    useCartStore.getState().addItem(mockProduct2, "S");
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.subtotal).toBe(0);
  });

  it("sets hydration flag", () => {
    useCartStore.getState().setHasHydrated(true);
    expect(useCartStore.getState().hasHydrated).toBe(true);
  });
});
