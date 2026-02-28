"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductSort } from "@/types/catalog";
import { useFilterStore } from "@/store/filter-store";

const allowedSorts: ProductSort[] = ["featured", "price-asc", "price-desc", "name"];
const allowedSizes = ["XS", "S", "M", "L", "XL"];

/**
 * Keeps the catalog filters aligned with the URL query string.
 */
export function useSyncFiltersWithUrl() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { size, category, sort, setFilter } = useFilterStore((state) => ({
    size: state.size,
    category: state.category,
    sort: state.sort,
    setFilter: state.setFilter,
  }));

  useEffect(() => {
    const nextSize = searchParams.get("size");
    const nextCategory = searchParams.get("category");
    const nextSort = searchParams.get("sort");

    if (nextSize && allowedSizes.includes(nextSize) && nextSize !== size) {
      setFilter("size", nextSize as typeof size);
    }

    if (nextCategory && nextCategory !== category) {
      setFilter("category", nextCategory);
    }

    if (nextSort && allowedSorts.includes(nextSort as ProductSort) && nextSort !== sort) {
      setFilter("sort", nextSort as ProductSort);
    }
  }, [category, searchParams, setFilter, size, sort]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (size === "all") {
      nextParams.delete("size");
    } else {
      nextParams.set("size", size);
    }

    if (category === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    if (sort === "featured") {
      nextParams.delete("sort");
    } else {
      nextParams.set("sort", sort);
    }

    const current = searchParams.toString();
    const next = nextParams.toString();

    if (current !== next) {
      const query = next ? `?${next}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    }
  }, [category, pathname, router, searchParams, size, sort]);
}
