import type { ClassSchedule } from '@/types/database'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function formatTime(time: string) {
  return time.slice(0, 5)
}

export function ScheduleCard({ schedules }: { schedules: ClassSchedule[] }) {
  if (!schedules.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📅</span>
        <p className="empty-state-title">Nenhum horário cadastrado</p>
      </div>
    )
  }

  const grouped = schedules.reduce<Record<number, ClassSchedule[]>>((acc, s) => {
    if (!acc[s.day_of_week]) acc[s.day_of_week] = []
    acc[s.day_of_week].push(s)
    return acc
  }, {})

  const today = new Date().getDay()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([day, items]) => {
          const dayNum = Number(day)
          const isToday = dayNum === today
          return (
            <div
              key={day}
              className="list-item"
              style={{
                borderLeft: isToday ? '2px solid var(--color-gold)' : '2px solid transparent',
                paddingLeft: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  flexShrink: 0,
                  textAlign: 'center',
                }}
              >
                <p className={`nkfs-tag-p ${isToday ? 'text-gold' : 'text-faint'}`}>
                  {DAYS[dayNum]}
                </p>
              </div>
              <div style={{ flex: 1 }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <p className="nkfs-p-m font-semibold text-main">
                      {item.title}
                    </p>
                    <p className="nkfs-tag-p text-muted font-mono">
                      {formatTime(item.start_time)} – {formatTime(item.end_time)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}