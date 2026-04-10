import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const mockMedusaPort = Number(process.env.E2E_MOCK_MEDUSA_PORT ?? 9999);
const mockMedusaUrl = `http://127.0.0.1:${mockMedusaPort}`;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/fixtures/**", "**/support/**", "**/mock-server/**"],
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    headless: process.env.CI ? true : undefined,
    locale: "en-US",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      // Mock Medusa boots in <100ms; Playwright starts it in parallel with
      // the Next.js webServer below but blocks on /health before running
      // any spec. The Next build almost always reaches dynamic rendering
      // after the mock is already accepting connections.
      command: "npm run e2e:mock-medusa",
      url: `${mockMedusaUrl}/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        E2E_MOCK_MEDUSA_PORT: String(mockMedusaPort),
      },
      stdout: "pipe",
      stderr: "pipe",
      timeout: 30_000,
    },
    {
      // `npm run build` during startup guarantees that static routes (e.g.
      // /api/categories, /sitemap.xml) evaluate against the mock server —
      // which is why we can point MEDUSA_BACKEND_URL at 127.0.0.1:9999
      // here and never touch the real backend during tests.
      command: "npm run build && npm run start -- -p 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      env: {
        MEDUSA_BACKEND_URL: mockMedusaUrl,
        MEDUSA_PUBLISHABLE_KEY: "pk_test_mock",
        STRIPE_SECRET_KEY: "sk_test_dummy",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_dummy",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      timeout: 240_000,
    },
  ],
});
