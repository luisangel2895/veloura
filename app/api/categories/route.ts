import { NextResponse } from "next/server";

import { delay } from "@/lib/data/delay";
import { getMockCategories } from "@/lib/data/mock-categories";
import type { CategoriesResponse } from "@/types/catalog";

export async function GET() {
  await delay(420);

  const categories = getMockCategories();

  return NextResponse.json<CategoriesResponse>({
    categories,
    generatedAt: new Date().toISOString(),
  });
}
