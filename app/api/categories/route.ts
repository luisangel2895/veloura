import { NextResponse } from "next/server";

import { delay } from "@/lib/data/delay";
import { getMockCategories } from "@/lib/data/mock-categories";
import type { CategoriesResponse } from "@/types/catalog";

export const revalidate = 300;

export async function GET() {
  await delay(420);

  const categories = getMockCategories();

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
}
