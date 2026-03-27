import { NextRequest, NextResponse } from "next/server";

import { getProducts } from "@/lib/medusa/client";
import type { ProductsResponse } from "@/types/catalog";

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") ?? undefined;
  const slug = searchParams.get("slug") ?? undefined;

  try {
    const products = await getProducts({
      categorySlug: category,
      slug,
    });

    return NextResponse.json<ProductsResponse>(
      {
        products,
        total: products.length,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("[api/products] Failed to fetch from Medusa:", error);

    return NextResponse.json<ProductsResponse>(
      {
        products: [],
        total: 0,
        generatedAt: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
}
