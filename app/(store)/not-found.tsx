import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This page could not be found in the store.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Back to Veloura
      </Link>
    </div>
  );
}
