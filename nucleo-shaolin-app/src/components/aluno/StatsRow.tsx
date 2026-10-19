interface Stat {
  label: string
  value: string | number
  sub?: string
}

interface StatsRowProps {
  stats: Stat[]
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3.5 w-full">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card p-3 sm:p-4 flex flex-col justify-between gap-1 min-w-0 transition-all hover:border-[var(--color-border-gold)] shadow-xs"
        >
          <span className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wider truncate">
            {stat.label}
          </span>
          <span className="text-xl sm:text-2xl font-black text-main leading-tight tracking-tight truncate">
            {stat.value}
          </span>
          {stat.sub && (
            <span className="text-[10px] sm:text-xs text-muted truncate mt-0.5">
              {stat.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}