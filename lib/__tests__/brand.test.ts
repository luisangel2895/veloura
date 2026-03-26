import { describe, expect, it } from "vitest";

import { brand } from "@/lib/brand";

describe("brand", () => {
  it("has a non-empty name", () => {
    expect(brand.name.length).toBeGreaterThan(0);
  });

  it("has a valid URL", () => {
    expect(() => new URL(brand.url)).not.toThrow();
  });

  it("has required fields", () => {
    expect(brand.shortDescription).toBeDefined();
    expect(brand.defaultTitle).toBeDefined();
  });
});
