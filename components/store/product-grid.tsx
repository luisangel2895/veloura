"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { ProductCard } from "@/components/store/product-card";
import type { Product } from "@/types/catalog";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card/70 dark:border-amber-500/10 dark:bg-card/60">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  const { copy } = useLanguage();

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-16 text-center dark:border-amber-500/20 dark:bg-card/60">
        <h2 className="text-3xl font-semibold">{copy.noProductsTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {copy.noProductsDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 3} />
      ))}
    </div>
  );
}
