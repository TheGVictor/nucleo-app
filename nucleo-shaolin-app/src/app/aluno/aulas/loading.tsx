export default function AulasLoading() {
  return (
    <div className="page-container py-5 flex flex-col gap-5 animate-pulse">
      <div className="h-16 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4" />
      <div className="h-14 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-28 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
        <div className="h-28 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
        <div className="h-28 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
        <div className="h-28 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
      </div>
    </div>
  )
}
