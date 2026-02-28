export type Size = "XS" | "S" | "M" | "L" | "XL";

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";

export interface ProductVariant {
  size: Size;
  inStock: boolean;
  label: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  categorySlug: string;
  priceCents: number;
  sizesAvailable: Size[];
  variants: ProductVariant[];
  tags: string[];
  description: string;
  details: string[];
  images: string[];
  palette: [string, string];
  featured: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoCopy: string;
  heroEyebrow: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  generatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  generatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  size: Size;
  priceCents: number;
  quantity: number;
  palette: [string, string];
}
