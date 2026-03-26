import { expect, test, type Page } from "@playwright/test";

type MockPaymentStatus = "succeeded" | "processing" | "requires_capture";

interface StripeInitPayload {
  status: MockPaymentStatus;
}

async function installFakeStripe(
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

async function mockPaymentIntent(page: Page): Promise<void> {
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

async function addProductToCart(page: Page, slug: string): Promise<void> {
  await page.goto(`/product/${slug}`);
  await page.getByTestId("add-to-cart").click();
}

async function goToCheckout(page: Page): Promise<void> {
  await page.getByTestId("cart-button").click();
  await page.locator('a[href="/checkout"]').click();
}

async function fillValidShipping(page: Page): Promise<void> {
  await page.locator("#shipping-full-name").fill("Angel Doe");
  await page.locator("#shipping-email").fill("angel@example.com");
  await page.locator("#shipping-city").selectOption("New York");
  await page.locator("#shipping-street").fill("Fifth Avenue");
  await page.locator("#shipping-street-number").fill("350");
  await page.locator("#shipping-postal-code").fill("10001");
  await page.locator("#shipping-reference").fill("Front desk concierge");
}

test.describe("critical checkout flow", () => {
  test("completes the happy path from home to complete", async ({ page }) => {
    await installFakeStripe(page);
    await mockPaymentIntent(page);

    await page.goto("/");
    await page.locator('a[href="/product/noir-essence-balconette"]').first().click();
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
    await installFakeStripe(page);
    await mockPaymentIntent(page);

    await addProductToCart(page, "noir-essence-balconette");
    await goToCheckout(page);

    await page.getByTestId("checkout-next").click();

    await expect(page.locator("#shipping-full-name-error")).toBeVisible();
    await expect(page.locator("#shipping-email-error")).toBeVisible();
    await expect(page.locator("#shipping-street-error")).toBeVisible();
    await expect(page.locator("#shipping-full-name")).toBeFocused();
    await expect(page.getByTestId("mock-payment-element")).toHaveCount(0);
  });

  test("keeps cart quantity and totals consistent with multiple items", async ({ page }) => {
    await addProductToCart(page, "noir-essence-balconette");
    await addProductToCart(page, "cashmere-hush-bralette");

    await expect(page.getByTestId("cart-button")).toContainText("2");

    await page.getByTestId("cart-button").click();

    await expect(page.getByText("Noir Essence Balconette")).toBeVisible();
    await expect(page.getByText("Cashmere Hush Bralette")).toBeVisible();
    await expect(page.getByText("$198.00").first()).toBeVisible();
  });
});
