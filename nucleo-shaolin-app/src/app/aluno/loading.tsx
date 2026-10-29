export default function AlunoLoading() {
  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-4 animate-pulse">
      <div className="h-14 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
      <div className="h-20 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
      <div className="h-20 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="h-28 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
        <div className="h-28 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
        <div className="h-28 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" />
      </div>
    </main>
  )
}
