"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { ProductImage } from "@/components/store/product-image";
import { Price } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

const MIN_QTY = 1;
const MAX_QTY = 10;

export function CartPage() {
  const { copy, locale } = useLanguage();
  const hasHydrated = useCart((state) => state.hasHydrated);
  const { items, subtotal, totalItems, removeItem, updateQty } = useCart((state) => ({
    items: state.items,
    subtotal: state.subtotal,
    totalItems: state.totalItems,
    removeItem: state.removeItem,
    updateQty: state.updateQty,
  }));
  const collectionCta = locale === "es" ? "Volver a la colección" : "Return to the collection";

  if (!hasHydrated) {
    return (
      <div className="rounded-[2.25rem] border border-border bg-card/80 px-6 py-16 text-center dark:border-amber-500/10 dark:bg-card/70">
        <h1 className="text-5xl font-semibold">{copy.cartTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          {copy.cartRestore}
        </p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[2.25rem] border border-dashed border-border bg-card/80 px-6 py-18 text-center dark:border-amber-500/20 dark:bg-card/70">
        <div className="mx-auto inline-flex size-16 items-center justify-center rounded-full border border-border bg-background/80 text-amber-700 dark:border-amber-500/10 dark:bg-background/30 dark:text-amber-200">
          <ShoppingBag className="size-6" />
        </div>
        <h1 className="mt-6 text-5xl font-semibold">{copy.cartEmptyTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          {copy.cartEmptyDescription}
        </p>
        <Button
          asChild
          className="mt-8 h-14 rounded-none bg-amber-700 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
        >
          <Link href="/">{collectionCta}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-5">
        <div className="flex flex-col gap-4 rounded-[2.25rem] border border-border bg-card/80 px-6 py-7 dark:border-amber-500/10 dark:bg-card/75 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
            <h1 className="text-5xl font-semibold">{copy.cartTitle}</h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {locale === "es"
                ? "Revisa cantidades, tallas y subtotales antes de pasar al checkout con validaciones por estado."
                : "Review quantities, sizes and subtotals before moving into a state-driven checkout."}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:text-right">
            <span className="inline-flex items-center gap-2 sm:justify-end">
              <Truck className="size-4" />
              {locale === "es" ? "Envío calculado en checkout" : "Shipping calculated in checkout"}
            </span>
            <span className="inline-flex items-center gap-2 sm:justify-end">
              <ShieldCheck className="size-4" />
              {locale === "es" ? "Estado persistente en localStorage" : "State persisted in local storage"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-5 rounded-[2rem] border border-border bg-card/80 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:border-amber-500/10 dark:bg-card/75 dark:hover:shadow-black/20 sm:grid-cols-[8.5rem_1fr_auto]"
            >
              <div className="h-36 overflow-hidden rounded-3xl">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                  seed={item.slug}
                  sizes="128px"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                    {item.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Size {item.size}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-border bg-background/80 p-1 dark:border-amber-500/10 dark:bg-background/30">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= MIN_QTY}
                      className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 dark:hover:bg-amber-500/10"
                      aria-label={locale === "es" ? "Reducir cantidad" : "Decrease quantity"}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= MAX_QTY}
                      className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 dark:hover:bg-amber-500/10"
                      aria-label={locale === "es" ? "Aumentar cantidad" : "Increase quantity"}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {locale === "es" ? `Máx ${MAX_QTY}` : `Max ${MAX_QTY}`}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="rounded-full border-border bg-transparent px-4 text-muted-foreground hover:bg-accent hover:text-foreground dark:border-amber-500/20 dark:hover:bg-amber-500/10"
                  >
                    {copy.cartRemove}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-3 justify-self-start sm:items-end sm:justify-self-end">
                <Price amountCents={item.priceCents * item.quantity} className="text-lg font-semibold" />
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <Price amountCents={item.priceCents} className="text-xs font-medium" />{" "}
                  {locale === "es" ? "por unidad" : "per unit"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/75 sm:p-8 lg:sticky lg:top-28">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
          {copy.cartSummary}
        </p>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {locale === "es" ? "Piezas seleccionadas" : "Selected pieces"}
            </span>
            <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{copy.cartSubtotal}</span>
            <Price amountCents={subtotal} className="text-base font-semibold" />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4 text-sm dark:border-amber-500/10">
            <span className="text-muted-foreground">
              {locale === "es" ? "Total estimado" : "Estimated total"}
            </span>
            <Price amountCents={subtotal} className="text-2xl font-semibold" />
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {locale === "es"
            ? "Envío e impuestos se revisan en el siguiente paso. El checkout mantiene su propia máquina de estados para no mezclar responsabilidades."
            : "Shipping and taxes are handled in the next step. Checkout keeps its own state machine so concerns stay isolated."}
        </p>
        <div className="mt-6 rounded-3xl border border-border bg-background/60 px-4 py-4 text-sm text-muted-foreground dark:border-amber-500/10 dark:bg-background/30">
          <p className="inline-flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="size-4" />
            {locale === "es" ? "Listo para checkout validado" : "Ready for validated checkout"}
          </p>
          <p className="mt-2 leading-6">
            {locale === "es"
              ? "El flujo siguiente ya separa envío, pago, revisión y confirmación para integrar Stripe sin rehacer el layout."
              : "The next flow already separates shipping, payment, review and confirmation so Stripe can be integrated without rewriting the layout."}
          </p>
        </div>
        <Button
          asChild
          className="mt-8 h-14 w-full rounded-none bg-amber-700 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
        >
          <Link href="/checkout">{copy.cartProceed}</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="mt-3 h-14 w-full rounded-none border-border bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-accent dark:border-amber-500/20 dark:hover:bg-amber-500/10"
        >
          <Link href="/">
            {collectionCta}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </aside>
    </div>
  );
}
