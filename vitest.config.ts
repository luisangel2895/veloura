import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: [
      "lib/**/__tests__/**/*.test.ts",
      "store/**/__tests__/**/*.test.ts",
      "components/**/__tests__/**/*.test.tsx",
    ],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: [
        "lib/**/*.ts",
        "store/**/*.ts",
        "components/seo/**/*.tsx",
        "components/store/price.tsx",
      ],
      exclude: ["**/__tests__/**", "**/data/**", "lib/medusa/**"],
      thresholds: {
        statements: 90,
        branches: 88,
        functions: 88,
        lines: 90,
      },
    },
  },
});
