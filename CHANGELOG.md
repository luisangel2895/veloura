# Changelog

All notable changes to Veloura Store will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-26

### Added

- HSTS, Permissions-Policy, and X-DNS-Prefetch-Control security headers
- Rate limiting middleware for Stripe API endpoints
- Error boundaries (`error.tsx`) for global and store route segments
- Custom 404 pages (`not-found.tsx`) for global and store routes
- Loading skeletons (`loading.tsx`) for store, product, and category pages
- Dynamic `<html lang>` attribute synced with user locale
- PWA web manifest (`manifest.webmanifest`)
- Hreflang alternate links for bilingual SEO
- Prettier formatter with consistent config
- Husky pre-commit hooks with lint-staged
- Expanded test suite: shipping, SEO metadata, i18n, brand, cart-store, filter-store
- Coverage thresholds enforcement in Vitest
- CI pipeline: npm audit, format check, Node 22 matrix, Playwright browser caching
- Skip-to-content accessibility link
- CHANGELOG and versioning structure

### Fixed

- `<html lang>` was hardcoded to "en" regardless of user locale
- Missing security headers (HSTS, Permissions-Policy)
- No rate limiting on payment intent creation endpoint

## [0.1.0] - 2025-02-28

### Added

- Initial release with Next.js 16 App Router
- Editorial product catalog with mock API
- Zustand cart with localStorage persistence
- Stripe PaymentIntent checkout flow
- Bilingual support (EN/ES) with cookie-based persistence
- SEO: metadata, robots.txt, sitemap, JSON-LD schemas
- Dark/light theme with next-themes
- CI/CD with GitHub Actions (lint, typecheck, unit tests, E2E)
- Responsive design with Tailwind CSS v4
