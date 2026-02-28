"use client";

import { useQuery } from "@tanstack/react-query";

import { getProductBySlug } from "@/api/catalog";
import type { Product } from "@/types/catalog";

/**
 * Fetches a single product by slug for the PDP.
 */
export function useProductQuery(slug: string, initialProduct?: Product) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
    initialData: initialProduct ?? null,
    staleTime: 60_000,
  });
}
