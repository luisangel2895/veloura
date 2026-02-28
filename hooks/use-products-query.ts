"use client";

import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/api/catalog";

/**
 * Fetches product collections and scopes them to an optional category.
 */
export function useProductsQuery(category?: string) {
  return useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: () => getProducts(category && category !== "all" ? { category } : undefined),
    staleTime: 60_000,
  });
}
