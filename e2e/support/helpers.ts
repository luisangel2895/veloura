/**
 * Shared helpers for E2E specs.
 *
 * Centralising selectors, locale-aware strings and Stripe mocking keeps the
 * specs focused on intent rather than plumbing. When a selector or a copy
 * string changes in the app, there is exactly one place to update here.
 */

import { expect, type Page } from "@playwright/test";

import { FIXTURE_CATEGORY_SLUGS, FIXTURE_PRODUCT_SLUGS } from "../fixtures/medusa-fixtures";

export const PRODUCT_SLUGS = FIXTURE_PRODUCT_SLUGS;
export const CATEGORY_SLUGS = FIXTURE_CATEGORY_SLUGS;

type MockPaymentStatus = "succeeded" | "processing" | "requires_capture";

interface StripeInitPayload {
  status: MockPaymentStatus;
}

/**
 * Installs a deterministic Stripe.js double on `window.Stripe` before any
 * page script runs. The mock renders a visible placeholder for PaymentElement
 * and resolves `confirmPayment()` with a fake PaymentIntent so the checkout
 * flow can advance without touching Stripe's network.
 */
export async function installFakeStripe(
  page: Page,
  paymentStatus: MockPaymentStatus = "succeeded",
): Promise<void> {
  await page.addInitScript(
    ({ status }: StripeInitPayload) => {
      window.Stripe = () => ({
        elements: () => ({
          create: () => {
            let host: HTMLElement | null = null;

            return {
              mount(target: string | HTMLElement) {
                host =
                  typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;

                if (host instanceof HTMLElement) {
                  const shell = document.createElement("div");
                  shell.setAttribute("data-testid", "mock-payment-element");
                  shell.textContent = "Mock Payment Element";
                  shell.style.minHeight = "72px";
                  shell.style.display = "flex";
                  shell.style.alignItems = "center";
                  shell.style.justifyContent = "center";
                  shell.style.border = "1px solid rgba(180,140,52,0.22)";
                  shell.style.borderRadius = "16px";
                  shell.style.fontSize = "12px";
                  shell.style.letterSpacing = "0.18em";
                  shell.style.textTransform = "uppercase";
                  shell.style.color = "rgb(113 113 122)";
                  host.replaceChildren(shell);
                }
              },
              unmount() {
                if (host instanceof HTMLElement) {
                  host.replaceChildren();
                }
              },
              destroy() {
                if (host instanceof HTMLElement) {
                  host.replaceChildren();
                }
              },
            };
          },
        }),
        async confirmPayment() {
          return {
            paymentIntent: {
              id: "pi_mock_checkout",
              status,
            },
          };
        },
      });
    },
    { status: paymentStatus },
  );
}

/**
 * Intercepts the client-side call to `/api/stripe/create-payment-intent`
 * and returns a deterministic `clientSecret` without hitting the real
 * Next.js route (which would otherwise reach out to Stripe).
 */
export async function mockPaymentIntent(page: Page): Promise<void> {
  await page.route("**/api/stripe/create-payment-intent", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        clientSecret: "cs_test_mocked_intent",
      }),
    });
  });
}

/**
 * Convenience wrapper: installs the Stripe.js double and the PaymentIntent
 * route interceptor in one call. Use at the start of any spec that crosses
 * the payment step.
 */
export async function mockStripe(page: Page): Promise<void> {
  await installFakeStripe(page);
  await mockPaymentIntent(page);
}

export async function addProductToCart(page: Page, slug: string): Promise<void> {
  await page.goto(`/product/${slug}`);
  await page.getByTestId("add-to-cart").click();
}

export async function goToCheckout(page: Page): Promise<void> {
  await page.getByTestId("cart-button").click();
  await page.locator('a[href="/checkout"]').click();
}

/**
 * Fills the shipping form with a valid US address that passes all of the
 * server-side validators in `/api/stripe/create-payment-intent` and the
 * client-side reducer in `lib/checkout/checkout-machine`.
 */
export async function fillValidShipping(page: Page): Promise<void> {
  await page.locator("#shipping-full-name").fill("Angel Doe");
  await page.locator("#shipping-email").fill("angel@example.com");
  await page.locator("#shipping-city").selectOption("New York");
  await page.locator("#shipping-street").fill("Fifth Avenue");
  await page.locator("#shipping-street-number").fill("350");
  await page.locator("#shipping-postal-code").fill("10001");
  await page.locator("#shipping-reference").fill("Front desk concierge");
}

export async function expectCartBadge(page: Page, count: number): Promise<void> {
  await expect(page.getByTestId("cart-button")).toContainText(String(count));
}
