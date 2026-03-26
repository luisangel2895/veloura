"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const CartPage = dynamic(() => import("@/components/store/cart-page").then((mod) => mod.CartPage), {
  ssr: false,
});

export function CartClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
        </div>
      }
    >
      <CartPage />
    </Suspense>
  );
}
