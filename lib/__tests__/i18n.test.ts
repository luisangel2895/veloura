import { describe, expect, it } from "vitest";

import { messages, resolveLocale } from "@/lib/i18n";

describe("i18n", () => {
  describe("resolveLocale", () => {
    it("defaults to es when no input", () => {
      expect(resolveLocale()).toBe("es");
      expect(resolveLocale(null)).toBe("es");
      expect(resolveLocale(undefined)).toBe("es");
    });

    it("resolves en from Accept-Language header", () => {
      expect(resolveLocale("en-US,en;q=0.9")).toBe("en");
      expect(resolveLocale("en")).toBe("en");
    });

    it("resolves es for non-english locales", () => {
      expect(resolveLocale("fr-FR")).toBe("es");
      expect(resolveLocale("de")).toBe("es");
    });
  });

  describe("messages", () => {
    it("has the same keys for both locales", () => {
      const esKeys = Object.keys(messages.es).sort();
      const enKeys = Object.keys(messages.en).sort();
      expect(esKeys).toEqual(enKeys);
    });

    it("has no empty message values", () => {
      for (const locale of ["es", "en"] as const) {
        for (const [key, value] of Object.entries(messages[locale])) {
          expect(value.trim().length, `${locale}.${key} is empty`).toBeGreaterThan(0);
        }
      }
    });
  });
});
