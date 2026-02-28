import { describe, expect, it } from "vitest";

import { isValidPostalCode } from "@/lib/checkout/shipping";
import { isRequiredText, isValidEmail } from "@/lib/checkout/validators";

describe("checkout validators", () => {
  it("accepts and rejects email addresses correctly", () => {
    expect(isValidEmail("angel@example.com")).toBe(true);
    expect(isValidEmail("angel+veloura@atelier.co")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("angel@")).toBe(false);
  });

  it("validates required text with minimum lengths", () => {
    expect(isRequiredText("Veloura")).toBe(true);
    expect(isRequiredText("  ")).toBe(false);
    expect(isRequiredText("abc", 3)).toBe(true);
    expect(isRequiredText("ab", 3)).toBe(false);
  });

  it("validates postal codes per supported country", () => {
    expect(isValidPostalCode("US", "10001")).toBe(true);
    expect(isValidPostalCode("US", "ABCDE")).toBe(false);
    expect(isValidPostalCode("CA", "M5V 2T6")).toBe(true);
    expect(isValidPostalCode("GB", "SW1A 1AA")).toBe(true);
    expect(isValidPostalCode("FR", "7500")).toBe(false);
  });
});
