export default function AdminLoading() {
  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-4 animate-pulse">
      <div className="h-14 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="h-24 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
        <div className="h-24 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
        <div className="h-24 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
        <div className="h-24 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
      </div>
      <div className="h-48 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
    </main>
  )
}
