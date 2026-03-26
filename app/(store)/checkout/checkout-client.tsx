"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const StripeProvider = dynamic(
  () => import("@/components/stripe/StripeProvider").then((mod) => mod.StripeProvider),
  { ssr: false },
);

const CheckoutFlow = dynamic(
  () => import("@/components/store/checkout-flow").then((mod) => mod.CheckoutFlow),
  { ssr: false },
);

export function CheckoutClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
            <p className="text-sm text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <StripeProvider>
        <CheckoutFlow />
      </StripeProvider>
    </Suspense>
  );
}
