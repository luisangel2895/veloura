"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductSort } from "@/types/catalog";
import { useFilterStore } from "@/store/filter-store";

const allowedSorts: ProductSort[] = ["featured", "price-asc", "price-desc", "name"];
const allowedSizes = ["XS", "S", "M", "L", "XL"] as const;

function normalize(v: string | null) {
  return v && v.length ? v : null;
}

/**
 * Keeps catalog filters aligned with the URL query string.
 * Tracks a pending query string so router.replace is not re-fired while
 * the same navigation is still in flight.
 */
export function useSyncFiltersWithUrl() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ estabilidad: Next recrea el objeto searchParams
  const qs = searchParams.toString();

  // ✅ sin shallow: selecciona por separado
  const setFilter = useFilterStore((s) => s.setFilter);
  const size = useFilterStore((s) => s.size);
  const category = useFilterStore((s) => s.category);
  const sort = useFilterStore((s) => s.sort);

  const pendingQueryStringRef = useRef<string | null>(null);

  // URL -> Store
  useEffect(() => {
    if (pendingQueryStringRef.current === qs) {
      pendingQueryStringRef.current = null;
      return;
    }

    const params = new URLSearchParams(qs);

    const nextSizeRaw = normalize(params.get("size"));
    const nextCategoryRaw = normalize(params.get("category"));
    const nextSortRaw = normalize(params.get("sort"));

    const nextSize =
      nextSizeRaw && (allowedSizes as readonly string[]).includes(nextSizeRaw) ? nextSizeRaw : null;

    const nextSort =
      nextSortRaw && allowedSorts.includes(nextSortRaw as ProductSort)
        ? (nextSortRaw as ProductSort)
        : null;

    const targetSize = (nextSize ?? "all") as typeof size;
    const targetCategory = nextCategoryRaw ?? "all";
    const targetSort = nextSort ?? "featured";

    const currentState = useFilterStore.getState();

    if (
      targetSize === currentState.size &&
      targetCategory === currentState.category &&
      targetSort === currentState.sort
    ) {
      return;
    }

    if (targetSize !== currentState.size) setFilter("size", targetSize);
    if (targetCategory !== currentState.category) setFilter("category", targetCategory);
    if (targetSort !== currentState.sort) setFilter("sort", targetSort);
  }, [qs, setFilter]);

  // Store -> URL
  useEffect(() => {
    const params = new URLSearchParams(qs);

    const apply = (key: string, value: string | null) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    };

    apply("size", size === "all" ? null : String(size));
    apply("category", category === "all" ? null : category);
    apply("sort", sort === "featured" ? null : sort);

    const nextQs = params.toString();
    if (nextQs === qs) {
      if (pendingQueryStringRef.current === qs) {
        pendingQueryStringRef.current = null;
      }
      return;
    }

    if (pendingQueryStringRef.current === nextQs) return;

    pendingQueryStringRef.current = nextQs;
    router.replace(nextQs ? `${pathname}?${nextQs}` : pathname, { scroll: false });
  }, [size, category, sort, qs, pathname, router]);
}
