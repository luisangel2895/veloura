import { NextRequest, NextResponse } from "next/server";

import { delay } from "@/lib/data/delay";
import { getMockProducts } from "@/lib/data/mock-products";
import type { ProductsResponse } from "@/types/catalog";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") ?? undefined;
  const slug = searchParams.get("slug") ?? undefined;

  await delay();

  const products = getMockProducts({
    categorySlug: category,
    slug,
  });

  return NextResponse.json<ProductsResponse>({
    products,
    total: products.length,
    generatedAt: new Date().toISOString(),
  });
}
