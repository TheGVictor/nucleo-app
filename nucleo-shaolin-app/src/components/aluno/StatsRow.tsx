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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        gap: '0.75rem',
      }}
    >
      {stats.map(stat => (
        <div key={stat.label} className="stat-box">
          <span className="stat-label">{stat.label}</span>
          <span className="stat-value">{stat.value}</span>
          {stat.sub && <span className="stat-sub">{stat.sub}</span>}
        </div>
      ))}
    </div>
  )
}