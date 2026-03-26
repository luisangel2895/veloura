import { describe, expect, it } from "vitest";

import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  createBaseMetadata,
  createCategoryMetadata,
  createGridMetadata,
  createHomeMetadata,
  createProductMetadata,
  getBaseUrl,
  toAbsoluteUrl,
} from "@/lib/seo/metadata";
import type { Category, Product } from "@/types/catalog";

const mockProduct: Product = {
  id: "vel-001",
  slug: "test-product",
  name: "Test Product",
  description: "A test product",
  priceCents: 5000,
  categorySlug: "balconette",
  images: ["/img/test.jpg"],
  sizes: ["S", "M", "L"],
  tags: ["luxury"],
  palette: ["#000", "#fff"],
};

const mockCategory: Category = {
  slug: "balconette",
  name: "Balconette",
  description: "Elegant balconette collection",
  heroEyebrow: "Classic",
  seoCopy: "SEO copy for balconette",
};

describe("SEO metadata", () => {
  it("getBaseUrl returns localhost when no env var is set", () => {
    expect(getBaseUrl()).toContain("localhost");
  });

  it("toAbsoluteUrl builds full URL from path", () => {
    const url = toAbsoluteUrl("/product/test");
    expect(url).toContain("/product/test");
  });

  it("toAbsoluteUrl returns absolute URLs unchanged", () => {
    expect(toAbsoluteUrl("https://example.com")).toBe("https://example.com");
  });

  it("createBaseMetadata returns valid metadata", () => {
    const meta = createBaseMetadata();
    expect(meta.title).toBeDefined();
    expect(meta.description).toBeDefined();
    expect(meta.openGraph).toBeDefined();
    expect(meta.twitter).toBeDefined();
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("createHomeMetadata returns home-specific metadata", () => {
    const meta = createHomeMetadata();
    expect(meta.title).toBeDefined();
    expect(meta.description).toBeDefined();
  });

  it("createGridMetadata returns grid-specific metadata", () => {
    const meta = createGridMetadata();
    expect(meta.title).toContain("collection");
  });

  it("createCategoryMetadata includes category name", () => {
    const meta = createCategoryMetadata(mockCategory);
    expect(meta.title).toContain("Balconette");
  });

  it("createProductMetadata includes product name", () => {
    const meta = createProductMetadata(mockProduct, mockCategory);
    expect(meta.title).toBe("Test Product");
  });

  it("buildBreadcrumbJsonLd generates valid schema", () => {
    const jsonLd = buildBreadcrumbJsonLd([{ name: "Home", url: "/" }, { name: "Products" }]);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(2);
  });

  it("buildOrganizationJsonLd generates valid schema", () => {
    const jsonLd = buildOrganizationJsonLd();
    expect(jsonLd["@type"]).toBe("Organization");
    expect(jsonLd.name).toBeDefined();
  });

  it("buildProductJsonLd generates valid product schema", () => {
    const jsonLd = buildProductJsonLd(mockProduct, mockCategory);
    expect(jsonLd["@type"]).toBe("Product");
    expect(jsonLd.name).toBe("Test Product");
    expect(jsonLd.offers["@type"]).toBe("Offer");
    expect(jsonLd.offers.price).toBe("50.00");
  });
});
