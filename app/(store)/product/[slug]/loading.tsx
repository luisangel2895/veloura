export default function ProductLoading() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[3/4] rounded-2xl bg-muted" />
        <div className="space-y-4 py-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="mt-8 h-12 w-40 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
