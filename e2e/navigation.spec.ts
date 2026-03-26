import { expect, test } from "@playwright/test";

test.describe("navigation and pages", () => {
  test("navigates to category page and displays products", async ({ page }) => {
    await page.goto("/category/balconette");
    await expect(page.getByText("Balconette Collection")).toBeVisible();
  });

  test("navigates to grid page and shows catalog", async ({ page }) => {
    await page.goto("/grid");
    await expect(page).toHaveTitle(/collection/i);
  });

  test("shows custom 404 for invalid product slug", async ({ page }) => {
    const response = await page.goto("/product/this-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("shows custom 404 for invalid category slug", async ({ page }) => {
    const response = await page.goto("/category/nonexistent");
    expect(response?.status()).toBe(404);
  });

  test("shows custom 404 for random page", async ({ page }) => {
    const response = await page.goto("/random-page-that-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("navigates from home to product detail", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/product/noir-essence-balconette"]').first().click();
    await expect(page.getByText("Noir Essence Balconette")).toBeVisible();
  });

  test("cart page shows empty state", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/cart/i).first()).toBeVisible();
  });

  test("policies page loads", async ({ page }) => {
    await page.goto("/policies");
    await expect(page).toHaveTitle(/policies|privacy/i);
  });

  test("our story page loads", async ({ page }) => {
    await page.goto("/our-story");
    await expect(page.locator("main")).toBeVisible();
  });
});
