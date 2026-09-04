function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-mf-card animate-pulse ${className}`}
      style={{ boxShadow: "0 1px 2px rgba(28,26,46,0.04), 0 8px 24px -12px rgba(46,40,96,0.12)" }}
    >
      <div className="h-full w-full rounded-2xl bg-mf-line" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-5">
      <SkeletonCard className="h-40" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
      </div>
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-40" />
    </div>
  );
}
