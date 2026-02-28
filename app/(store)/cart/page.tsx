import type { Metadata } from "next";

import { CartPage } from "@/components/store/cart-page";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review products, update quantities and continue to the reducer-based checkout.",
};

export default function CartRoute() {
  return <CartPage />;
}
