"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/api/catalog";
import { FilterBar } from "@/components/store/filter-bar";
import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { useProductsQuery } from "@/hooks/use-products-query";
import { useSyncFiltersWithUrl } from "@/hooks/use-sync-filters-with-url";
import { useFilterStore } from "@/store/filter-store";
import type { Category, Product, ProductSort, Size } from "@/types/catalog";

interface CatalogViewProps {
  title: string;
  eyebrow: string;
  description: string;
  promoLabel: string;
  promoCopy: string;
  lockedCategory?: string;
  syncWithUrl?: boolean;
  seoCopy?: string;
}

function sortProducts(products: Product[], sort: ProductSort) {
  const copy = [...products];

  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

function FilterUrlSyncBridge() {
  useSyncFiltersWithUrl();
  return null;
}

export function CatalogView({
  title,
  eyebrow,
  description,
  promoLabel,
  promoCopy,
  lockedCategory,
  syncWithUrl = false,
  seoCopy,
}: CatalogViewProps) {
  const { size, category, sort, setFilter, clearFilters } = useFilterStore((state) => ({
    size: state.size,
    category: state.category,
    sort: state.sort,
    setFilter: state.setFilter,
    clearFilters: state.clearFilters,
  }));

  const activeCategory = lockedCategory ?? (category !== "all" ? category : undefined);
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 60_000,
  });
  const productsQuery = useProductsQuery(activeCategory);

  const visibleProducts = sortProducts(
    (productsQuery.data ?? []).filter((product) =>
      size === "all" ? true : product.sizesAvailable.includes(size as Size),
    ),
    sort,
  );

  const categories = (categoriesQuery.data ?? []).map((item: Category) => ({
    slug: item.slug,
    name: item.name,
  }));

  return (
    <div className="space-y-8 pb-16">
      {syncWithUrl ? (
        <Suspense fallback={null}>
          <FilterUrlSyncBridge />
        </Suspense>
      ) : null}

      <section className="grid gap-8 rounded-[2rem] border border-amber-500/10 bg-card/70 p-6 shadow-sm sm:p-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <Badge className="bg-amber-500/10 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.32em] text-amber-200">
            {eyebrow}
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-amber-500/10 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent p-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-amber-200">
            Private Atelier
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold">
            Intimacy, refined.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Built with a typed mock API, query caching, URL-synced filters and store slices that
            can graduate to a real commerce backend.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-500/10 bg-amber-500/8 px-6 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-amber-200">
              {promoLabel}
            </p>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">{promoCopy}</p>
          </div>
          <Badge
            variant="outline"
            className="border-amber-500/20 bg-transparent px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.28em] text-amber-100"
          >
            Complimentary garment pouch
          </Badge>
        </div>
      </section>

      <FilterBar
        size={size}
        category={lockedCategory ?? category}
        sort={sort}
        categories={categories}
        showCategoryFilter={!lockedCategory}
        onSizeChange={(nextSize) => setFilter("size", nextSize)}
        onCategoryChange={(nextCategory) => setFilter("category", nextCategory)}
        onSortChange={(nextSort) => setFilter("sort", nextSort)}
        onClear={() => {
          clearFilters();
          if (lockedCategory) {
            setFilter("category", lockedCategory);
          }
        }}
      />

      <ProductGrid products={visibleProducts} loading={productsQuery.isLoading || categoriesQuery.isLoading} />

      {seoCopy ? (
        <section className="rounded-3xl border border-amber-500/10 bg-card/70 p-6 sm:p-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-200">
            Editorial Notes
          </p>
          <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">{seoCopy}</p>
        </section>
      ) : null}
    </div>
  );
}
