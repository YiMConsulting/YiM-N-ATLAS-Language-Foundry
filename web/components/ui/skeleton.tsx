export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-border bg-surface ${className}`}
    />
  );
}
