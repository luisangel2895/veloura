"use client";

import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useLanguage } from "@/components/providers/language-provider";
import { getCategories } from "@/api/catalog";
import { FilterBar } from "@/components/store/filter-bar";
import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  enablePagination?: boolean;
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

function PaginatedCatalogGrid({
  products,
  loading,
  pageSize = 9,
}: {
  products: Product[];
  loading: boolean;
  pageSize?: number;
}) {
  const { copy } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedProducts = products.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return <ProductGrid products={products} loading />;
  }

  return (
    <div className="space-y-8">
      <ProductGrid products={pagedProducts} />

      {totalPages > 1 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-amber-500/10 bg-card/70 px-5 py-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {copy.paginationPage} {currentPage} {copy.paginationOf} {totalPages}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="border-amber-500/20 bg-transparent hover:bg-amber-500/10"
            >
              {copy.paginationPrevious}
            </Button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <Button
                  key={page}
                  type="button"
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "bg-amber-300 text-zinc-950 hover:bg-amber-200"
                      : "border-amber-500/20 bg-transparent hover:bg-amber-500/10"
                  }
                >
                  {page}
                </Button>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="border-amber-500/20 bg-transparent hover:bg-amber-500/10"
            >
              {copy.paginationNext}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CatalogView({
  title,
  eyebrow,
  description,
  promoLabel,
  promoCopy,
  lockedCategory,
  syncWithUrl = false,
  enablePagination = false,
  seoCopy,
}: CatalogViewProps) {
  const { copy } = useLanguage();
  const size = useFilterStore((s) => s.size);
  const category = useFilterStore((s) => s.category);
  const sort = useFilterStore((s) => s.sort);
  const setFilter = useFilterStore((s) => s.setFilter);
  const clearFilters = useFilterStore((s) => s.clearFilters);

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
  const paginationKey = `${activeCategory ?? "all"}-${size}-${sort}`;
  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;

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
            {copy.privateAtelier}
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold">
            {copy.intimacyRefined}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {copy.architectureCopy}
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
            {copy.complimentaryPouch}
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
          if (lockedCategory) setFilter("category", lockedCategory);
        }}
      />

      {enablePagination ? (
        <PaginatedCatalogGrid key={paginationKey} products={visibleProducts} loading={isLoading} />
      ) : (
        <ProductGrid products={visibleProducts} loading={isLoading} />
      )}

      {seoCopy ? (
        <section className="rounded-3xl border border-amber-500/10 bg-card/70 p-6 sm:p-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-200">
            {copy.editorialNotes}
          </p>
          <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">{seoCopy}</p>
        </section>
      ) : null}
    </div>
  );
}
