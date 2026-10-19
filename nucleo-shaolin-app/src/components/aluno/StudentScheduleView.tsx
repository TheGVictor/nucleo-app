'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { ClassSchedule } from '@/types/database'

interface ScheduleWithModality extends ClassSchedule {
  modality?: {
    id: string
    name: string
    slug: string
  } | null
}

const WEEKDAYS = [
  { id: 1, label: 'Segunda', short: 'Seg' },
  { id: 2, label: 'Terça', short: 'Ter' },
  { id: 3, label: 'Quarta', short: 'Qua' },
  { id: 4, label: 'Quinta', short: 'Qui' },
  { id: 5, label: 'Sexta', short: 'Sex' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
]

export function StudentScheduleView({
  schedules,
}: {
  schedules: ScheduleWithModality[]
}) {
  const currentDay = new Date().getDay()
  // Se for domingo (0), abre em segunda (1) por padrão
  const initialDay = currentDay >= 1 && currentDay <= 6 ? currentDay : 1

  const [selectedDay, setSelectedDay] = useState<number | 'all'>(initialDay)
  const [search, setSearch] = useState('')

  const filtered = schedules.filter((s) => {
    const matchesDay = selectedDay === 'all' || s.day_of_week === selectedDay
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      (s.modality?.name && s.modality.name.toLowerCase().includes(q)) ||
      s.start_time.includes(q)
    return matchesDay && matchesSearch
  })

  // Agrupamento por dia da semana
  const grouped = filtered.reduce<Record<number, ScheduleWithModality[]>>((acc, s) => {
    if (!acc[s.day_of_week]) acc[s.day_of_week] = []
    acc[s.day_of_week].push(s)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Filtros por Dia */}
      <div className="card p-3 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedDay('all')}
            className={`modality-chip ${selectedDay === 'all' ? 'active' : ''} text-xs py-1.5 px-3 whitespace-nowrap`}
          >
            Semana Completa
          </button>
          {WEEKDAYS.map((d) => {
            const isSelected = selectedDay === d.id
            const isToday = currentDay === d.id
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDay(d.id)}
                className={`modality-chip ${isSelected ? 'active' : ''} text-xs py-1.5 px-3 flex items-center gap-1.5 whitespace-nowrap`}
              >
                <span>{d.label}</span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse" title="Hoje" />
                )}
              </button>
            )
          })}
        </div>

        {/* Busca por Turma / Modalidade */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por turma, modalidade (ex: Kids, Sanda, Tai Chi, Iniciantes)..."
            className="input text-xs py-2 px-3 w-full"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Caso Quarta-feira selecionada (Escola Fechada) */}
      {selectedDay === 3 && (
        <div className="card p-8 text-center flex flex-col items-center border border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <span className="text-4xl mb-2">🔒</span>
          <h3 className="nkfs-h-p font-bold text-main">Escola Fechada na Quarta-feira</h3>
          <p className="nkfs-p-m text-muted mt-1 max-w-md">
            Às quartas-feiras o dojô não tem aulas regulares, sendo dedicado ao descanso, manutenção do espaço e treinamento dos instrutores.
          </p>
        </div>
      )}

      {/* Lista de Aulas Agrupadas por Dia */}
      {selectedDay !== 3 && (
        <div className="flex flex-col gap-5">
          {WEEKDAYS.filter((d) => selectedDay === 'all' || selectedDay === d.id).map((day) => {
            const classes = grouped[day.id] || []
            const isToday = currentDay === day.id

            if (day.id === 3 && selectedDay === 'all') {
              return (
                <div key={day.id} className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold">Quarta-feira</span>
                  <span className="italic">Escola fechada (sem aulas)</span>
                </div>
              )
            }

            if (classes.length === 0 && selectedDay !== 'all') {
              return (
                <div key={day.id} className="card p-8 text-center text-muted">
                  Nenhuma aula encontrada para este dia ou filtro.
                </div>
              )
            }

            if (classes.length === 0) return null

            return (
              <div key={day.id} className="flex flex-col gap-2.5">
                {/* Cabeçalho do Dia */}
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="nkfs-p-m font-bold text-main">
                      {day.label}-feira
                    </h3>
                    {isToday && (
                      <Badge variant="gold">⚡ Hoje</Badge>
                    )}
                  </div>
                  <span className="nkfs-tag-p text-muted">
                    {classes.length} {classes.length === 1 ? 'aula' : 'aulas'}
                  </span>
                </div>

                {/* Grid de Cards de Aula */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {classes.map((cls) => {
                    const startFormatted = cls.start_time.slice(0, 5)
                    const endFormatted = cls.end_time.slice(0, 5)

                    return (
                      <div
                        key={cls.id}
                        className={`card-elevated p-4 flex flex-col justify-between transition-all hover:border-[var(--color-border-gold)] ${
                          isToday ? 'border-l-4 border-l-[var(--color-gold)]' : ''
                        }`}
                      >
                        <div>
                          {/* Horário & Modalidade */}
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <span className="nkfs-tag-p font-mono text-gold font-bold px-2 py-0.5 rounded bg-[var(--color-gold-muted)] border border-[var(--color-border-gold)]">
                              ⏰ {startFormatted} – {endFormatted}
                            </span>
                            <span className="nkfs-tag-p text-muted font-medium">
                              {cls.modality?.name ? `🥋 ${cls.modality.name}` : '🥋 Kung Fu Shaolin'}
                            </span>
                          </div>

                          {/* Título da Turma */}
                          <h4 className="nkfs-h-p font-bold text-main leading-snug">
                            {cls.title}
                          </h4>
                        </div>

                        <div className="pt-2 mt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-muted">
                          <span className="nkfs-tag-p text-faint">📍 Dojô Núcleo Shaolin</span>
                          <span className="nkfs-tag-p text-gold font-medium">Presencial</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
