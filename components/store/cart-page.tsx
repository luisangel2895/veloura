"use client";

import Link from "next/link";

import { useLanguage } from "@/components/providers/language-provider";
import { ProductImage } from "@/components/store/product-image";
import { Price } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export function CartPage() {
  const { copy } = useLanguage();
  const hasHydrated = useCart((state) => state.hasHydrated);
  const { items, subtotal, removeItem, updateQty } = useCart((state) => ({
    items: state.items,
    subtotal: state.subtotal,
    removeItem: state.removeItem,
    updateQty: state.updateQty,
  }));

  if (!hasHydrated) {
    return (
      <div className="rounded-[2rem] border border-amber-500/10 bg-card/70 px-6 py-16 text-center">
        <h1 className="text-5xl font-semibold">{copy.cartTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          {copy.cartRestore}
        </p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-amber-500/20 bg-card/70 px-6 py-16 text-center">
        <h1 className="text-5xl font-semibold">{copy.cartEmptyTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          {copy.cartEmptyDescription}
        </p>
        <Button asChild className="mt-8 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">
          <Link href="/">{copy.cartReturn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <h1 className="text-5xl font-semibold">{copy.cartTitle}</h1>
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-[2rem] border border-amber-500/10 bg-card/75 p-5 sm:grid-cols-[8rem_1fr_auto]"
            >
              <div className="h-32 overflow-hidden rounded-3xl">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                  seed={item.slug}
                  sizes="128px"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                    {item.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Size {item.size}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="border-amber-500/20 bg-transparent hover:bg-amber-500/10"
                  >
                    -
                  </Button>
                  <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="border-amber-500/20 bg-transparent hover:bg-amber-500/10"
                  >
                    +
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:bg-transparent hover:text-foreground"
                  >
                    {copy.cartRemove}
                  </Button>
                </div>
              </div>
              <div className="justify-self-start sm:justify-self-end">
                <Price amountCents={item.priceCents * item.quantity} className="text-lg font-semibold" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-[2rem] border border-amber-500/10 bg-card/75 p-6 sm:p-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-200">
          {copy.cartSummary}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-muted-foreground">{copy.cartSubtotal}</span>
          <Price amountCents={subtotal} className="text-2xl font-semibold" />
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Shipping and taxes are intentionally omitted from the mock flow. The checkout reducer
          models the full sequence independently from the cart store.
        </p>
        <Button asChild className="mt-8 h-12 w-full rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">
          <Link href="/checkout">{copy.cartProceed}</Link>
        </Button>
      </aside>
    </div>
  );
}
