import { describe, expect, it } from "vitest";

import {
  getShippingFeeCents,
  isValidCityForCountry,
  isValidPostalCode,
  SUPPORTED_COUNTRY_CODES,
} from "@/lib/checkout/shipping";

describe("shipping", () => {
  describe("getShippingFeeCents", () => {
    it("returns a fee for standard shipping", () => {
      const fee = getShippingFeeCents("standard");
      expect(fee).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(fee)).toBe(true);
    });

    it("returns a fee for express shipping", () => {
      const fee = getShippingFeeCents("express");
      expect(fee).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(fee)).toBe(true);
    });

    it("express costs more than or equal to standard", () => {
      expect(getShippingFeeCents("express")).toBeGreaterThanOrEqual(
        getShippingFeeCents("standard"),
      );
    });
  });

  describe("isValidCityForCountry", () => {
    it("accepts valid cities for US", () => {
      expect(isValidCityForCountry("US", "New York")).toBe(true);
    });

    it("rejects invalid cities for US", () => {
      expect(isValidCityForCountry("US", "FakeCity12345")).toBe(false);
    });
  });

  describe("isValidPostalCode", () => {
    it.each([
      ["US", "90210", true],
      ["US", "ABC", false],
      ["CA", "K1A 0B1", true],
      ["GB", "EC1A 1BB", true],
      ["FR", "75001", true],
      ["FR", "7500", false],
      ["ES", "28001", true],
      ["MX", "01000", true],
    ])("validates %s postal code %s → %s", (country, code, expected) => {
      expect(isValidPostalCode(country as (typeof SUPPORTED_COUNTRY_CODES)[number], code)).toBe(
        expected,
      );
    });
  });
});
