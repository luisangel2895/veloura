## Local Development

Run the app locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Local checkout expects these Stripe variables:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is required client-side for the checkout payment step.
`STRIPE_SECRET_KEY` is required server-side for real local Stripe test mode.

In CI, the workflow injects dummy values:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_SECRET_KEY=sk_test_dummy
```

Those are enough for build/test because E2E uses a fake Stripe provider and mocked `create-payment-intent`.

## Stripe Test Mode

Use Stripe test card `4242 4242 4242 4242`, any future date, any CVC, and any ZIP code.

## Testing

Run the unit suite:

```bash
npm run test
```

Run unit tests in watch mode:

```bash
npm run test:watch
```

Run coverage:

```bash
npm run test:coverage
```

Run the critical Playwright flows:

```bash
npm run e2e
```

Run Playwright in UI mode:

```bash
npm run e2e:ui
```

Open the Playwright HTML report after a run:

```bash
npm run e2e:report
```

If this is the first time running Playwright in the repo, install the browser once:

```bash
npx playwright install chromium
```

## CI

GitHub Actions runs on:

- every `pull_request`
- every push to `main`

The workflow has two required jobs:

- `quality`: install, lint, typecheck, unit tests with coverage
- `e2e`: Playwright critical path with mocked Stripe

The E2E job uploads these artifacts on every run, including failures:

- `playwright-report/`
- `test-results/`

Coverage from the unit suite is also uploaded from `quality`.

## Branch Protection Recommended

Recommended GitHub branch protection for `main`:

- require status checks: `quality` and `e2e`
- require branches to be up to date before merging
- disallow direct pushes to `main`
- require pull requests before merge
