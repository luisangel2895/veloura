"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">Something went wrong</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
