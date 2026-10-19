'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  createClassScheduleAction,
  updateClassScheduleAction,
  deleteClassScheduleAction,
  type ClassScheduleWithModality,
} from '@/app/admin/horarios/actions'

interface ModalityOption {
  id: string
  name: string
  slug: string
}

interface ScheduleManagerProps {
  initialSchedules: ClassScheduleWithModality[]
  modalities: ModalityOption[]
  isReadOnly?: boolean
}

const WEEKDAYS = [
  { index: 1, name: 'Segunda-feira', short: 'Seg' },
  { index: 2, name: 'Terça-feira', short: 'Ter' },
  { index: 3, name: 'Quarta-feira', short: 'Qua' },
  { index: 4, name: 'Quinta-feira', short: 'Qui' },
  { index: 5, name: 'Sexta-feira', short: 'Sex' },
  { index: 6, name: 'Sábado', short: 'Sáb' },
]

export function ScheduleManager({
  initialSchedules,
  modalities,
  isReadOnly = false,
}: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<ClassScheduleWithModality[]>(initialSchedules)
  const [selectedDay, setSelectedDay] = useState<number>(1) // Segunda por padrão
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Estado do Modal (criar ou editar)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClassScheduleWithModality | null>(null)

  // Campos do formulário
  const [formTitle, setFormTitle] = useState('')
  const [formDay, setFormDay] = useState<number>(1)
  const [formStartTime, setFormStartTime] = useState('18:00')
  const [formEndTime, setFormEndTime] = useState('19:00')
  const [formModalityId, setFormModalityId] = useState(modalities[0]?.id || '')

  function handleOpenCreate() {
    setEditingItem(null)
    setFormTitle('')
    setFormDay(selectedDay)
    setFormStartTime('18:00')
    setFormEndTime('19:00')
    setFormModalityId(modalities[0]?.id || '')
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(item: ClassScheduleWithModality) {
    setEditingItem(item)
    setFormTitle(item.title)
    setFormDay(item.day_of_week)
    setFormStartTime(item.start_time.slice(0, 5))
    setFormEndTime(item.end_time.slice(0, 5))
    setFormModalityId(item.modality_id)
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim() || !formModalityId) return

    setErrorMsg(null)
    startTransition(async () => {
      if (editingItem) {
        // Atualização
        const res = await updateClassScheduleAction(editingItem.id, {
          title: formTitle,
          day_of_week: formDay,
          start_time: formStartTime,
          end_time: formEndTime,
          modality_id: formModalityId,
        })

        if (res.success && res.data) {
          setSchedules((prev) =>
            prev.map((s) => (s.id === editingItem.id ? res.data! : s))
          )
          setIsModalOpen(false)
        } else {
          setErrorMsg(res.error || 'Erro ao atualizar aula')
        }
      } else {
        // Criação
        const res = await createClassScheduleAction({
          title: formTitle,
          day_of_week: formDay,
          start_time: formStartTime,
          end_time: formEndTime,
          modality_id: formModalityId,
        })

        if (res.success && res.data) {
          setSchedules((prev) => [...prev, res.data!])
          setIsModalOpen(false)
        } else {
          setErrorMsg(res.error || 'Erro ao criar aula')
        }
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Deseja realmente remover este horário da grade?')) return

    startTransition(async () => {
      const res = await deleteClassScheduleAction(id)
      if (res.success) {
        setSchedules((prev) => prev.filter((s) => s.id !== id))
      } else {
        alert(res.error || 'Erro ao remover horário')
      }
    })
  }

  // Aulas do dia selecionado
  const currentDayClasses = schedules
    .filter((s) => s.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const selectedDayInfo = WEEKDAYS.find((d) => d.index === selectedDay)

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── BARRA SUPERIOR: DIAS DA SEMANA E BOTÃO NOVA AULA ─────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-bg-card)] p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xs">
        {/* Abas dos dias da semana */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {WEEKDAYS.map((day) => {
            const count = schedules.filter((s) => s.day_of_week === day.index).length
            const isSelected = selectedDay === day.index

            return (
              <button
                key={day.index}
                type="button"
                onClick={() => setSelectedDay(day.index)}
                className={`px-3 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[var(--color-gold)] text-black shadow-xs'
                    : 'text-muted hover:text-main hover:bg-[var(--color-bg-elevated)]'
                }`}
              >
                <span>{day.short}</span>
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

        {/* Botão Adicionar Nova Aula (Apenas Sifu) */}
        {!isReadOnly && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-gold btn-sm text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto shrink-0 shadow-xs"
          >
            <span>＋</span>
            <span>Nova Aula</span>
          </button>
        )}
      </div>

      {/* ── GRADE DE AULAS DO DIA SELECIONADO ────────────────────── */}
      <div className="card p-5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="nkfs-h-p text-main font-bold">
              {selectedDayInfo?.name}
            </h2>
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

                {/* Ações: Editar e Deletar (Apenas Sifu) */}
                {!isReadOnly && (
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="btn btn-secondary btn-sm text-xs py-1 px-2.5"
                      title="Editar aula"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-ghost btn-sm text-xs text-red-500 hover:text-red-700 py-1 px-2"
                      title="Remover aula"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center justify-center text-muted">
            <span className="text-3xl mb-2">🚪</span>
            <p className="nkfs-p-m font-bold text-main">
              {selectedDay === 3 ? 'Escola fechada às quartas-feiras' : 'Nenhuma aula cadastrada para este dia'}
            </p>
            {!isReadOnly && (
              <p className="text-xs text-muted mt-1 max-w-sm">
                Clique em &ldquo;Nova Aula&rdquo; para adicionar horários e turmas a este dia da semana.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: CRIAR / EDITAR HORÁRIO DE AULA ──────────────────── */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-2xl p-6 flex flex-col gap-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3.5">
              <h3 className="text-xl sm:text-2xl text-main font-bold">
                {editingItem ? 'Editar Horário de Aula' : 'Nova Aula na Grade'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-main text-sm font-bold px-2 py-1 rounded hover:bg-[var(--color-bg-elevated)]"
              >
                ✕ Fechar
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-main block mb-1.5">
                  Título da Turma / Faixas Atendidas:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Iniciantes e Intermediário Adulto, Kids, Faixa Preta..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input text-sm sm:text-base py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-sm font-bold text-main block mb-1.5">
                    Dia da Semana:
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                    className="input text-sm sm:text-base py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                  >
                    {WEEKDAYS.map((w) => (
                      <option key={w.index} value={w.index}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-main block mb-1.5">
                    Modalidade:
                  </label>
                  <select
                    value={formModalityId}
                    onChange={(e) => setFormModalityId(e.target.value)}
                    className="input text-sm sm:text-base py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                  >
                    {modalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-sm font-bold text-main block mb-1.5">
                    Horário de Início:
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="input text-sm sm:text-base py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-main block mb-1.5">
                    Horário de Término:
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="input text-sm sm:text-base py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[var(--color-border)] mt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-sm text-sm px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-gold btn-sm font-bold flex items-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Spinner size="sm" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Aula</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
