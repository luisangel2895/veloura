import type { Metadata } from "next";

import { CartClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review products, update quantities and continue to the reducer-based checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartRoute() {
  return <CartClient />;
}
