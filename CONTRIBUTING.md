# Contributing to Veloura Store

## Getting Started

```bash
git clone <repo-url>
cd veloura-store
npm install
cp .env.local.example .env.local  # add your Stripe test keys
npm run dev
```

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure quality gates pass:
   ```bash
   npm run lint          # ESLint
   npm run typecheck     # TypeScript
   npm run test          # Unit tests (Vitest)
   npm run format:check  # Prettier
   ```
4. Run E2E tests if touching UI:
   ```bash
   npm run e2e
   ```
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `perf:` performance improvement
   - `refactor:` code change that neither fixes a bug nor adds a feature
   - `test:` adding or updating tests
   - `docs:` documentation changes
   - `ci:` CI/CD changes
6. Open a pull request against `main`

## Project Structure

```
app/              → Next.js App Router pages and API routes
components/       → React components (ui/, store/, layout/, providers/, seo/)
hooks/            → Custom React hooks
lib/              → Business logic, utilities, i18n, SEO metadata
store/            → Zustand state management
types/            → TypeScript type definitions
e2e/              → Playwright E2E tests
```

## Testing

- **Unit tests**: `npm run test` — Vitest with v8 coverage
- **Component tests**: Uses `@testing-library/react` with jsdom
- **E2E tests**: `npm run e2e` — Playwright with Chromium
- **Accessibility**: axe-core integrated in E2E suite
- **Coverage thresholds** are enforced — tests will fail if coverage drops below the configured minimums

## Code Quality

- **Prettier** formats all files on commit via husky + lint-staged
- **ESLint** with Next.js core-web-vitals and TypeScript rules
- **TypeScript** in strict mode

## Releases

Releases are managed with `standard-version`:

```bash
npm run release          # auto-detect version bump
npm run release:minor    # force minor bump
npm run release:major    # force major bump
```

This updates the version in `package.json`, generates CHANGELOG entries from
conventional commits, creates a git tag, and commits everything.

## Environment Variables

| Variable                             | Scope       | Description                |
| ------------------------------------ | ----------- | -------------------------- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public      | Stripe publishable key     |
| `STRIPE_SECRET_KEY`                  | Server only | Stripe secret key          |
| `NEXT_PUBLIC_SITE_URL`               | Public      | Canonical site URL for SEO |
