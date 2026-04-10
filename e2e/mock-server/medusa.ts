/**
 * Mock Medusa Store API used during E2E test runs.
 *
 * This process listens on E2E_MOCK_MEDUSA_PORT (default 9999) and serves
 * deterministic fixtures from ../fixtures/medusa-fixtures.ts. It implements
 * only the endpoints that lib/medusa/client.ts consumes:
 *
 *   GET  /health                     liveness probe for Playwright webServer
 *   GET  /store/products             list or filter by handle / category_id
 *   GET  /store/products/:id         single product by id
 *   GET  /store/product-categories   list or filter by handle
 *
 * No database, no state, no Stripe — just an HTTP facade that starts in
 * under 100ms and exits cleanly on SIGTERM.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";

import {
  CATEGORIES_FIXTURE,
  PRODUCTS_FIXTURE,
  type MedusaCategoryFixture,
  type MedusaProductFixture,
} from "../fixtures/medusa-fixtures";

const PORT = Number(process.env.E2E_MOCK_MEDUSA_PORT ?? 9999);
const HOST = process.env.E2E_MOCK_MEDUSA_HOST ?? "127.0.0.1";
const LOG_PREFIX = "[mock-medusa]";

function jsonResponse(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": String(Buffer.byteLength(payload)),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(payload);
}

function filterProductsByHandle(handle: string | null): MedusaProductFixture[] {
  if (!handle) return PRODUCTS_FIXTURE;
  return PRODUCTS_FIXTURE.filter((product) => product.handle === handle);
}

function filterProductsByCategoryId(
  products: MedusaProductFixture[],
  categoryId: string | null,
): MedusaProductFixture[] {
  if (!categoryId) return products;
  return products.filter((product) =>
    product.categories.some((category) => category.id === categoryId),
  );
}

function filterCategoriesByHandle(handle: string | null): MedusaCategoryFixture[] {
  if (!handle) return CATEGORIES_FIXTURE;
  return CATEGORIES_FIXTURE.filter((category) => category.handle === handle);
}

function parseLimit(raw: string | null, fallback: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, 200);
}

function handleStoreProducts(url: URL, res: ServerResponse): void {
  const handle = url.searchParams.get("handle");
  const categoryId = url.searchParams.get("category_id");
  const limit = parseLimit(url.searchParams.get("limit"), 100);

  const filtered = filterProductsByCategoryId(filterProductsByHandle(handle), categoryId);
  const sliced = filtered.slice(0, limit);

  jsonResponse(res, 200, {
    products: sliced,
    count: sliced.length,
    offset: 0,
    limit,
  });
}

function handleStoreProductById(productId: string, res: ServerResponse): void {
  const product = PRODUCTS_FIXTURE.find((candidate) => candidate.id === productId);
  if (!product) {
    jsonResponse(res, 404, { message: `Product ${productId} not found` });
    return;
  }
  jsonResponse(res, 200, { product });
}

function handleStoreProductCategories(url: URL, res: ServerResponse): void {
  const handle = url.searchParams.get("handle");
  const limit = parseLimit(url.searchParams.get("limit"), 50);

  const categories = filterCategoriesByHandle(handle).slice(0, limit);

  jsonResponse(res, 200, {
    product_categories: categories,
    count: categories.length,
    offset: 0,
    limit,
  });
}

function route(req: IncomingMessage, res: ServerResponse): void {
  const requestUrl = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);
  const pathname = requestUrl.pathname;
  const method = req.method ?? "GET";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-publishable-api-key",
    });
    res.end();
    return;
  }

  if (method !== "GET") {
    jsonResponse(res, 405, { message: `Method ${method} not allowed` });
    return;
  }

  if (pathname === "/health") {
    jsonResponse(res, 200, { status: "ok", service: "mock-medusa", port: PORT });
    return;
  }

  if (pathname === "/store/products") {
    handleStoreProducts(requestUrl, res);
    return;
  }

  const productMatch = pathname.match(/^\/store\/products\/([^/]+)$/);
  if (productMatch) {
    handleStoreProductById(productMatch[1], res);
    return;
  }

  if (pathname === "/store/product-categories") {
    handleStoreProductCategories(requestUrl, res);
    return;
  }

  jsonResponse(res, 404, {
    message: `No mock handler for ${method} ${pathname}`,
  });
}

const server = createServer((req, res) => {
  try {
    route(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error(`${LOG_PREFIX} handler error:`, message);
    if (!res.headersSent) {
      jsonResponse(res, 500, { message });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`${LOG_PREFIX} listening on http://${HOST}:${PORT}`);
});

function shutdown(signal: string): void {
  console.log(`${LOG_PREFIX} received ${signal}, closing...`);
  server.close(() => process.exit(0));
  // Failsafe: if close() hangs, exit forcefully after 5s.
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
