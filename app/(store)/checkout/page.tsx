import type { Metadata } from "next";

import { CheckoutFlow } from "@/components/store/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Reducer-driven checkout state machine with shipping, payment, review and completion states.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
