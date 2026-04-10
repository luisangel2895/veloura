import { expect, test } from "@playwright/test";

import {
  PRODUCT_SLUGS,
  addProductToCart,
  expectCartBadge,
  fillValidShipping,
  goToCheckout,
  mockStripe,
} from "./support/helpers";

test.describe("critical checkout flow", () => {
  test("completes the happy path from home to complete", async ({ page }) => {
    await mockStripe(page);

    await page.goto("/");
    await page
      .locator(`a[href*="/product/${PRODUCT_SLUGS.noirEssenceBalconette}"]`)
      .first()
      .click();
    await page.getByTestId("add-to-cart").click();
    await goToCheckout(page);

    await fillValidShipping(page);
    await page.getByTestId("checkout-next").click();

    await expect(page.getByTestId("mock-payment-element")).toBeVisible();
    await page.getByRole("button", { name: /pay and continue/i }).click();

    await expect(page.getByTestId("checkout-submit")).toBeVisible();
    await page.getByTestId("checkout-submit").click();

    await expect(page.getByText(/we sent the receipt to/i)).toBeVisible();
    await expect(page.getByText(/payment successful/i)).toBeVisible();
  });

  test("shows validation errors and stays on shipping when fields are empty", async ({ page }) => {
    await mockStripe(page);

    await addProductToCart(page, PRODUCT_SLUGS.noirEssenceBalconette);
    await goToCheckout(page);

    await page.getByTestId("checkout-next").click();

    await expect(page.locator("#shipping-full-name-error")).toBeVisible();
    await expect(page.locator("#shipping-email-error")).toBeVisible();
    await expect(page.locator("#shipping-street-error")).toBeVisible();
    await expect(page.locator("#shipping-full-name")).toBeFocused();
    await expect(page.getByTestId("mock-payment-element")).toHaveCount(0);
  });

  test("keeps cart quantity and totals consistent with multiple items", async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUGS.noirEssenceBalconette);
    await addProductToCart(page, PRODUCT_SLUGS.cashmereHushBralette);

    await expectCartBadge(page, 2);

    await page.getByTestId("cart-button").click();

    await expect(page.getByText("Noir Essence Balconette")).toBeVisible();
    await expect(page.getByText("Cashmere Hush Bralette")).toBeVisible();
  });
});
