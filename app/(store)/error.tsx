"use client";

import Link from "next/link";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Something went wrong</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        {error.message || "We encountered an unexpected error while loading this page."}
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
