import { apiClient } from "@/api/client";
import type { CategoriesResponse, Category, Product, ProductsResponse } from "@/types/catalog";

interface ProductQuery {
  category?: string;
  slug?: string;
}

export async function getProducts(query?: ProductQuery): Promise<Product[]> {
  const response = await apiClient.get<ProductsResponse>("/products", {
    params: query,
  });

  return response.data.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts({ slug });
  return products[0] ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<CategoriesResponse>("/categories");
  return response.data.categories;
}
