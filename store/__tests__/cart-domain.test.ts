import { describe, expect, it } from "vitest";

import { calculateCartTotals } from "@/store/cart-domain";
import type { CartItem } from "@/types/catalog";

const basePalette: [string, string] = ["#1b1a1e", "#7e6843"];

function buildItem(overrides: Partial<CartItem>): CartItem {
  return {
    id: "item-1",
    productId: "vel-001",
    slug: "noir-essence-balconette",
    name: "Noir Essence Balconette",
    imageUrl: "/brand/veloura-logo.png",
    size: "M",
    priceCents: 11200,
    quantity: 1,
    palette: basePalette,
    ...overrides,
  };
}

describe("calculateCartTotals", () => {
  it("returns subtotal in integer cents and the correct item count", () => {
    const totals = calculateCartTotals([
      buildItem({ quantity: 2 }),
      buildItem({
        id: "item-2",
        productId: "vel-002",
        slug: "cashmere-hush-bralette",
        name: "Cashmere Hush Bralette",
        priceCents: 8600,
        quantity: 1,
      }),
    ]);

    expect(totals.totalItems).toBe(3);
    expect(totals.subtotal).toBe(31000);
  });

  it("remains stable with cent-based prices and avoids floating point math", () => {
    const totals = calculateCartTotals([
      buildItem({
        id: "item-3",
        priceCents: 199,
        quantity: 2,
      }),
      buildItem({
        id: "item-4",
        priceCents: 299,
        quantity: 1,
      }),
    ]);

    expect(totals.subtotal).toBe(697);
    expect(totals.totalItems).toBe(3);
  });
});
