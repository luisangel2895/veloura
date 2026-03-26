import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "es"] as const;
const DEFAULT_LOCALE = "es";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function resolveLocaleFromRequest(request: NextRequest): string {
  const cookieLocale = request.cookies.get("veloura-locale")?.value;
  if (
    cookieLocale &&
    SUPPORTED_LOCALES.includes(cookieLocale as (typeof SUPPORTED_LOCALES)[number])
  ) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().includes("en")) {
    return "en";
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for Stripe API
  if (pathname.startsWith("/api/stripe")) {
    const key = getRateLimitKey(request);
    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    return NextResponse.next();
  }

  // Skip locale handling for API, static files, and internal routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/videos") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/robots")
  ) {
    return NextResponse.next();
  }

  // Check if the URL starts with a locale prefix
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (SUPPORTED_LOCALES.includes(maybeLocale as (typeof SUPPORTED_LOCALES)[number])) {
    // URL has locale prefix (e.g., /en/product/foo) → rewrite to real path
    const locale = maybeLocale;
    const realPath = "/" + segments.slice(2).join("/") || "/";
    const url = request.nextUrl.clone();
    url.pathname = realPath;

    const response = NextResponse.rewrite(url);
    response.cookies.set("veloura-locale", locale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  // No locale prefix → redirect to prefixed URL
  const locale = resolveLocaleFromRequest(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match everything except static files with extensions
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|mp4|webm|css|js|woff2?|ttf|eot)).*)",
  ],
};
