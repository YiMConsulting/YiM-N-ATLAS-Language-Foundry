export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Coming soon
      </p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted">
        This workspace is scaffolded and ready for implementation.
      </p>
    </div>
  );
}
