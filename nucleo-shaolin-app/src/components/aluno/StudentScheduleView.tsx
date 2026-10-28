'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { ClassSchedule, Profile } from '@/types/database'

interface ScheduleWithModality extends ClassSchedule {
  modality?: {
    id: string
    name: string
    slug: string
  } | null
}

export type StudentCategory = 'kids' | 'iniciante' | 'avancado' | 'preta'

export function determineStudentCategory(
  birthDate?: string | null,
  guardianName?: string | null,
  clfLevelOrder: number = 1
): { category: StudentCategory; label: string } {
  let isKid = false
  if (guardianName && guardianName.trim()) {
    isKid = true
  } else if (birthDate) {
    const birth = new Date(birthDate)
    const ageDiff = Date.now() - birth.getTime()
    const ageDate = new Date(ageDiff)
    const age = Math.abs(ageDate.getUTCFullYear() - 1970)
    if (!isNaN(age) && age < 14) isKid = true
  }

  if (isKid) {
    return { category: 'kids', label: 'Turma Infantil (Kids / Crianças)' }
  }

  if (clfLevelOrder >= 10) {
    return { category: 'preta', label: 'Adulto - Faixa Preta' }
  }

  if (clfLevelOrder === 9) {
    return { category: 'avancado', label: 'Adulto Avançado' }
  }

  return { category: 'iniciante', label: 'Adulto Iniciante e Intermediário' }
}

export function matchesStudentSchedule(
  schedule: ScheduleWithModality,
  category: StudentCategory,
  hasTaiChi: boolean,
  hasSanda: boolean
): boolean {
  const title = schedule.title.toLowerCase()
  const modSlug = schedule.modality?.slug?.toLowerCase() || ''

  // Aulas especiais da escola aparecem para todos
  if (title.includes('especial')) return true

  // Tai Chi
  if (modSlug.includes('taichi') || title.includes('tai chi')) {
    return hasTaiChi
  }

  // Sanda
  if (modSlug.includes('sanda') || title.includes('sanda')) {
    return hasSanda
  }

  // Choy Lay Fut / Kung Fu por categoria:
  const isKidsClass =
    title.includes('kids') || title.includes('criança') || title.includes('siu lung')
  const isInicianteClass =
    title.includes('iniciante') ||
    title.includes('intermediário') ||
    title.includes('intermediario')
  const isAvancadoClass = title.includes('avançado') || title.includes('avancado')
  const isPretaClass = title.includes('faixa preta') || title.includes('preta')

  if (category === 'kids') {
    return isKidsClass
  }

  if (category === 'iniciante') {
    return isInicianteClass
  }

  if (category === 'avancado') {
    return isAvancadoClass
  }

  if (category === 'preta') {
    return isPretaClass || isAvancadoClass
  }

  return false
}

const WEEKDAYS = [
  { index: 1, name: 'Segunda-feira', short: 'Seg' },
  { index: 2, name: 'Terça-feira', short: 'Ter' },
  { index: 3, name: 'Quarta-feira', short: 'Qua' },
  { index: 4, name: 'Quinta-feira', short: 'Qui' },
  { index: 5, name: 'Sexta-feira', short: 'Sex' },
  { index: 6, name: 'Sábado', short: 'Sáb' },
]

interface StudentScheduleViewProps {
  schedules: ScheduleWithModality[]
  profile?: Profile | null
  studentModalities?: Array<{
    modality?: { slug?: string; name?: string } | null
    approved_graduation?: { level_order?: number } | null
  }>
}

export function StudentScheduleView({
  schedules,
  profile,
  studentModalities = [],
}: StudentScheduleViewProps) {
  const currentDay = new Date().getDay()
  // Se for domingo (0), abre em segunda (1) por padrão
  const initialDay = currentDay >= 1 && currentDay <= 6 ? currentDay : 1

  const [selectedDay, setSelectedDay] = useState<number>(initialDay)
  const [showOnlyMyClasses, setShowOnlyMyClasses] = useState(true)
  const [search, setSearch] = useState('')

  // Modalidades em que o aluno está matriculado
  const enrolledSlugs = studentModalities.map(
    (m) => m.modality?.slug?.toLowerCase() || ''
  )
  const hasTaiChi = enrolledSlugs.some((s) => s.includes('taichi'))
  const hasSanda = enrolledSlugs.some((s) => s.includes('sanda'))
  const clfMod = studentModalities.find((m) =>
    (m.modality?.slug || '').toLowerCase().includes('clf')
  )
  const clfLevelOrder = clfMod?.approved_graduation?.level_order ?? 1

  // Determina categoria do aluno (Kids vs Iniciante vs Avançado vs Preta)
  const categoryInfo = determineStudentCategory(
    profile?.birth_date,
    profile?.guardian_name,
    clfLevelOrder
  )

  // Filtra as aulas de acordo com a categoria e busca
  const displayedSchedules = schedules.filter((s) => {
    if (showOnlyMyClasses) {
      const matches = matchesStudentSchedule(
        s,
        categoryInfo.category,
        hasTaiChi,
        hasSanda
      )
      if (!matches) return false
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        s.title.toLowerCase().includes(q) ||
        (s.modality?.name && s.modality.name.toLowerCase().includes(q)) ||
        s.start_time.includes(q)
      if (!matchesSearch) return false
    }

    return true
  })

  // Aulas do dia selecionado
  const currentDayClasses = displayedSchedules
    .filter((s) => s.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const selectedDayInfo = WEEKDAYS.find((d) => d.index === selectedDay)

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── CARD IDENTIFICADOR DE TURMA / FILTRO ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] border border-[var(--color-border-gold)] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
            🥋
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted block leading-none">
              Sua Turma de Treino
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-gold mt-0.5">
              {categoryInfo.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowOnlyMyClasses(!showOnlyMyClasses)}
            className={`btn btn-xs py-1 px-3 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
              showOnlyMyClasses
                ? 'bg-amber-500/15 border-[var(--color-border-gold)] text-gold'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-muted hover:text-main'
            }`}
          >
            {showOnlyMyClasses ? '✓ Apenas Meus Horários' : 'Mostrando Toda a Grade'}
          </button>
        </div>
      </div>

      {/* ── BARRA SUPERIOR: DIAS DA SEMANA (IDÊNTICA AO ADMIN) ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-bg-card)] p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xs">
        {/* Abas dos dias da semana */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {WEEKDAYS.map((day) => {
            const count = displayedSchedules.filter((s) => s.day_of_week === day.index).length
            const isSelected = selectedDay === day.index
            const isToday = currentDay === day.index

            return (
              <button
                key={day.index}
                type="button"
                onClick={() => setSelectedDay(day.index)}
                className={`px-3 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-gold)] text-black shadow-xs'
                    : 'text-muted hover:text-main hover:bg-[var(--color-bg-elevated)]'
                }`}
              >
                <span>{day.short}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-[var(--color-gold)]'}`}
                    title="Hoje"
                  />
                )}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full font-mono ${
                      isSelected
                        ? 'bg-black/20 text-black'
                        : 'bg-[var(--color-bg-elevated)] text-muted'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Busca rápida */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar turmas..."
            className="input text-xs py-1.5 px-3 w-full bg-[var(--color-bg-elevated)]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-main text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── GRADE DE AULAS DO DIA SELECIONADO (IDÊNTICA AO ADMIN) ── */}
      <div className="card p-5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="nkfs-h-p text-main font-bold">
              {selectedDayInfo?.name}
            </h2>
            {currentDay === selectedDay && (
              <Badge variant="gold">Hoje</Badge>
            )}
          </div>
          <Badge variant={currentDayClasses.length > 0 ? 'gold' : 'muted'}>
            {currentDayClasses.length} {currentDayClasses.length === 1 ? 'aula programada' : 'aulas programadas'}
          </Badge>
        </div>

        {currentDayClasses.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {currentDayClasses.map((item) => (
              <div
                key={item.id}
                className="card-elevated p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--color-gold)] transition-all"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-16 text-center font-mono font-bold text-xs bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded px-2 py-1 shrink-0 text-gold">
                    {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                  </div>

                  <div>
                    <h3 className="nkfs-p-m font-bold text-main leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="nkfs-tag-p text-muted">
                        Modalidade: <strong className="text-main">{item.modality?.name}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center justify-center text-muted">
            <span className="text-3xl mb-2">🚪</span>
            <p className="nkfs-p-m font-bold text-main">
              {selectedDay === 3
                ? 'Escola fechada às quartas-feiras'
                : showOnlyMyClasses
                ? `Nenhuma aula programada para sua turma (${categoryInfo.label}) neste dia`
                : 'Nenhuma aula cadastrada para este dia'}
            </p>
            {showOnlyMyClasses && selectedDay !== 3 && (
              <button
                type="button"
                onClick={() => setShowOnlyMyClasses(false)}
                className="text-xs text-gold hover:underline mt-2 font-semibold cursor-pointer"
              >
                Ver grade de horários de outras turmas deste dia →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
