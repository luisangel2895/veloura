import { NextResponse } from "next/server";
import { z } from "zod";

import {
  SHIPPING_METHOD_CODES,
  SUPPORTED_COUNTRY_CODES,
  getShippingFeeCents,
  isValidCityForCountry,
  isValidPostalCode,
} from "@/lib/checkout/shipping";
import { mockProducts } from "@/lib/data/mock-products";

export const runtime = "nodejs";

const BASE_CURRENCY = "usd";
const STRIPE_TIMEOUT_MS = 10_000;

const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  size: z.string().optional(),
});

const shippingSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  country: z.enum(SUPPORTED_COUNTRY_CODES),
  city: z.string().min(1),
  street: z.string().min(2),
  streetNumber: z.string().min(1),
  apartment: z.string().trim().max(24).optional(),
  reference: z.string().min(6).max(160),
  postalCode: z.string().min(1),
  shippingMethod: z.enum(SHIPPING_METHOD_CODES),
});

const requestSchema = z.object({
  items: z.array(itemSchema).min(1),
  shipping: shippingSchema,
});

function computeTrustedAmount(
  items: Array<z.infer<typeof itemSchema>>,
  shippingMethod: z.infer<typeof shippingSchema>["shippingMethod"],
) {
  return items.reduce((sum, item) => {
    const product = mockProducts.find((candidate) => candidate.id === item.id);

    if (!product) {
      throw new Error(`Unknown product id: ${item.id}`);
    }

    return sum + product.priceCents * item.quantity;
  }, getShippingFeeCents(shippingMethod));
}

function buildStripeBody(params: {
  amount: number;
  currency: string;
  email: string;
  items: Array<z.infer<typeof itemSchema>>;
  shipping: z.infer<typeof shippingSchema>;
}) {
  const body = new URLSearchParams();

  body.set("amount", String(params.amount));
  body.set("currency", params.currency);
  body.set("receipt_email", params.email);
  body.set("automatic_payment_methods[enabled]", "true");
  body.set("metadata[cart_size]", String(params.items.length));
  body.set("metadata[shipping_method]", params.shipping.shippingMethod);
  body.set("metadata[shipping_country]", params.shipping.country);
  body.set("metadata[shipping_city]", params.shipping.city);
  body.set(
    "metadata[item_ids]",
    params.items
      .map((item) => item.id)
      .slice(0, 20)
      .join(","),
  );
  body.set(
    "metadata[quantities]",
    params.items
      .map((item) => `${item.id}:${item.quantity}`)
      .slice(0, 20)
      .join(","),
  );

  return body;
}

async function createStripePaymentIntent(requestBody: URLSearchParams, secretKey: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STRIPE_TIMEOUT_MS);

  try {
    return await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      {
        error: "Missing STRIPE_SECRET_KEY.",
      },
      { status: 500 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid payment intent request.",
      },
      { status: 400 },
    );
  }

  try {
    if (!isValidCityForCountry(parsed.data.shipping.country, parsed.data.shipping.city)) {
      return NextResponse.json(
        {
          error: "City is not available for the selected country.",
        },
        { status: 400 },
      );
    }

    if (!isValidPostalCode(parsed.data.shipping.country, parsed.data.shipping.postalCode)) {
      return NextResponse.json(
        {
          error: "Postal code does not match the selected country.",
        },
        { status: 400 },
      );
    }

    const amount = computeTrustedAmount(
      parsed.data.items,
      parsed.data.shipping.shippingMethod,
    );
    const stripeResponse = await createStripePaymentIntent(
      buildStripeBody({
        amount,
        currency: BASE_CURRENCY,
        email: parsed.data.shipping.email,
        items: parsed.data.items,
        shipping: parsed.data.shipping,
      }),
      secretKey,
    );

    const stripePayload = (await stripeResponse.json()) as
      | { client_secret?: string; error?: { message?: string } }
      | undefined;

    if (!stripeResponse.ok || !stripePayload?.client_secret) {
      return NextResponse.json(
        {
          error:
            stripePayload?.error?.message ?? "Stripe could not create the PaymentIntent.",
        },
        { status: stripeResponse.status || 500 },
      );
    }

    return NextResponse.json(
      {
        clientSecret: stripePayload.client_secret,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Stripe timed out while creating the PaymentIntent.",
        },
        { status: 504 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to create the PaymentIntent.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
