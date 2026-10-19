export default function AlunoLoading() {
  return (
    <div className="page-container py-5 flex flex-col gap-5 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-28 rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] border border-[var(--color-border)] p-5 flex flex-col justify-between">
        <div className="h-4 w-1/4 bg-[var(--color-border)] rounded" />
        <div className="h-7 w-1/2 bg-[var(--color-border)] rounded" />
      </div>

      {/* Quick Action Grid Skeleton */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-20 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
        <div className="h-20 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
        <div className="h-20 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
      </div>

      {/* Card Content Skeleton */}
      <div className="h-56 rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
    </div>
  )
}
