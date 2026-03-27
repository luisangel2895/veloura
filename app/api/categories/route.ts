import { NextResponse } from "next/server";

import { getCategories } from "@/lib/medusa/client";
import type { CategoriesResponse } from "@/types/catalog";

export const revalidate = 300;

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json<CategoriesResponse>(
      {
        categories,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("[api/categories] Failed to fetch from Medusa:", error);

    return NextResponse.json<CategoriesResponse>(
      {
        categories: [],
        generatedAt: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
}
