/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  checkAttendanceBoxAction,
  uncheckAttendanceBoxAction,
  uploadAttendanceCardPhotoAction,
  type StudentAttendanceCardData,
} from '@/app/admin/attendance/actions'

interface AttendanceCardProps {
  initialData: StudentAttendanceCardData
  isInstructor?: boolean
  onUpdated?: () => void
}

export function AttendanceCard({
  initialData,
  isInstructor = false,
  onUpdated,
}: AttendanceCardProps) {
  const [data, setData] = useState<StudentAttendanceCardData>(initialData)
  const [activeTab, setActiveTab] = useState<'checkboxes' | 'photo' | 'split'>('checkboxes')
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedSlotForUncheck, setSelectedSlotForUncheck] = useState<{
    attendanceId: string
    slotNumber: number
    date: string
  } | null>(null)

  const attendances = data.attendances
  const target = data.totalClassesTarget || 30
  const totalSlots = Math.max(target, attendances.length)
  const progressPercent = Math.min(100, Math.round((attendances.length / target) * 100))

  function showMessage(type: 'success' | 'error', message: string) {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // ── MARCAR PRÓXIMA AULA OU SLOT ESPECÍFICO ────────────────────
  function handleCheckSlot(classDate?: string) {
    if (!isInstructor) return

    startTransition(async () => {
      const res = await checkAttendanceBoxAction(data.student.id, classDate)
      if (res.success && res.attendance) {
        setData((prev) => ({
          ...prev,
          attendances: [...prev.attendances, res.attendance!],
        }))
        showMessage('success', `Presença #${attendances.length + 1} registrada com sucesso!`)
        onUpdated?.()
      } else {
        showMessage('error', res.error || 'Erro ao registrar presença')
      }
    })
  }

  // ── DESMARCAR PRESENÇA ─────────────────────────────────────────
  function handleConfirmUncheck() {
    if (!selectedSlotForUncheck || !isInstructor) return

    const { attendanceId, slotNumber } = selectedSlotForUncheck

    startTransition(async () => {
      const res = await uncheckAttendanceBoxAction(attendanceId, data.student.id)
      if (res.success) {
        setData((prev) => ({
          ...prev,
          attendances: prev.attendances.filter((a) => a.id !== attendanceId),
        }))
        setSelectedSlotForUncheck(null)
        showMessage('success', `Presença #${slotNumber} desmarcada.`)
        onUpdated?.()
      } else {
        showMessage('error', res.error || 'Erro ao desmarcar presença')
      }
    })
  }

  // ── UPLOAD DA FOTO DA FICHA FÍSICA DE PAPEL ───────────────────
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('studentId', data.student.id)

    try {
      const res = await uploadAttendanceCardPhotoAction(formData)
      if (res.success && res.photoUrl) {
        setData((prev) => ({ ...prev, cardPhotoUrl: res.photoUrl! }))
        showMessage('success', 'Foto da ficha física anexada com sucesso!')
        setActiveTab('photo')
        onUpdated?.()
      } else {
        showMessage('error', res.error || 'Erro ao enviar foto')
      }
    } catch {
      showMessage('error', 'Erro de conexão ao enviar imagem')
    } finally {
      setUploading(false)
      // Limpa input
      e.target.value = ''
    }
  }

  return (
    <div className="card-elevated p-5 sm:p-6 flex flex-col gap-5 border-2 border-[var(--color-border-gold)] shadow-lg relative overflow-hidden bg-gradient-to-b from-[var(--color-bg-card)] to-[var(--color-bg-elevated)]">
      {/* Marca d'água marcial de fundo */}
      <div className="absolute -right-8 -top-8 text-8xl opacity-5 pointer-events-none select-none font-serif">
        武
      </div>

      {/* ── CABEÇALHO DO CARTÃO DE FREQUÊNCIA ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🥋</span>
            <span className="nkfs-tag-p text-gold uppercase tracking-widest font-extrabold">
              Núcleo Shaolin · Cartão de Frequência
            </span>
          </div>
          <h2 className="nkfs-h-m text-main font-bold">
            {data.student.full_name}
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="nkfs-tag-p text-primary font-semibold">
              {data.modalityName}
            </span>
            <span className="text-faint">·</span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs"
                style={{ backgroundColor: data.graduationColor }}
              />
              <span className="nkfs-p-m font-bold text-main">
                {data.graduationName}
              </span>
            </div>
          </div>
        </div>

        {/* Resumo Numérico & Progresso do Aluno */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 bg-[var(--color-bg-card)] px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-xs">
          <div className="flex items-baseline gap-1.5">
            <span className="nkfs-h-m text-gold font-extrabold font-mono">
              {attendances.length}
            </span>
            <span className="nkfs-p-m text-muted">/ {target} aulas</span>
          </div>

          <div className="w-36 sm:w-44 h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden border border-[var(--color-border)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="nkfs-tag-p text-muted">
            {progressPercent}% para próximo exame
          </span>
        </div>
      </div>

      {/* ── FEEDBACK ALERT ───────────────────────────────────────── */}
      {feedback && (
        <div
          className={`p-3 rounded-[var(--radius-sm)] flex items-center justify-between text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-75 hover:opacity-100 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── BARRA DE CONTROLE: ABAS & AÇÕES DO INSTRUTOR ──────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-bg-card)] p-2 rounded-[var(--radius-md)] border border-[var(--color-border)]">
        {/* Abas de Visualização */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg-elevated)] rounded-[var(--radius-sm)]">
          <button
            type="button"
            onClick={() => setActiveTab('checkboxes')}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
              activeTab === 'checkboxes'
                ? 'bg-[var(--color-bg-card)] text-gold shadow-xs font-bold'
                : 'text-muted hover:text-main'
            }`}
          >
            📋 Checkboxes ({attendances.length}/{target})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'photo'
                ? 'bg-[var(--color-bg-card)] text-gold shadow-xs font-bold'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>📸 Foto da Ficha</span>
            {data.cardPhotoUrl ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Foto disponível" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500/50" title="Sem foto física" />
            )}
          </button>
        </div>

        {/* Ações Específicas do Instrutor */}
        {isInstructor && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Upload/Câmera de Foto da Ficha */}
            <label className="btn btn-outline btn-sm cursor-pointer flex items-center gap-1.5 text-xs">
              {uploading ? (
                <>
                  <Spinner size="sm" />
                  <span>Enviando foto...</span>
                </>
              ) : (
                <>
                  <span>📷</span>
                  <span>{data.cardPhotoUrl ? 'Atualizar Foto' : 'Fotografar Ficha'}</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Check Rápido de Presença */}
            <button
              type="button"
              onClick={() => handleCheckSlot()}
              disabled={isPending}
              className="btn btn-gold btn-sm flex items-center gap-1.5 shadow-sm text-xs"
            >
              {isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span>⚡</span>
                  <span>Check Presença Hoje</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── CONTEÚDO DA ABA: CHECKBOXES DA FICHA ──────────────────── */}
      {activeTab === 'checkboxes' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              {isInstructor
                ? 'Toque em um checkbox vazio para marcar presença, ou em um marcado para desmarcar.'
                : 'Seus registros de presença oficiais carimbados pelo instrutor.'}
            </span>
            <Badge variant="gold">Grade de {target} Aulas</Badge>
          </div>

          {/* Grid de Checkboxes Estilizado (Cartão de Frequência Marcial) */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5 sm:gap-3">
            {Array.from({ length: totalSlots }).map((_, index) => {
              const slotNumber = index + 1
              const attendanceRecord = attendances[index]
              const isChecked = !!attendanceRecord

              return (
                <button
                  key={slotNumber}
                  type="button"
                  disabled={!isInstructor || isPending}
                  onClick={() => {
                    if (!isInstructor) return
                    if (isChecked) {
                      setSelectedSlotForUncheck({
                        attendanceId: attendanceRecord.id,
                        slotNumber,
                        date: new Date(attendanceRecord.class_date).toLocaleDateString('pt-BR'),
                      })
                    } else {
                      handleCheckSlot()
                    }
                  }}
                  className={`relative p-2.5 sm:p-3 rounded-[var(--radius-sm)] flex flex-col items-center justify-between min-h-[76px] transition-all border text-center ${
                    isChecked
                      ? 'bg-gradient-to-b from-amber-500/15 to-amber-500/5 border-amber-500/40 text-main shadow-xs'
                      : 'bg-[var(--color-bg-card)] border-dashed border-[var(--color-border)] text-muted hover:border-[var(--color-gold)]'
                  } ${isInstructor ? 'cursor-pointer hover:scale-102 active:scale-98' : 'cursor-default'}`}
                  title={
                    isChecked
                      ? `Aula #${slotNumber}: Presente em ${new Date(attendanceRecord.class_date).toLocaleDateString('pt-BR')}`
                      : isInstructor
                      ? `Aula #${slotNumber}: Clique para marcar presença`
                      : `Aula #${slotNumber}: Pendente`
                  }
                >
                  {/* Número do Slot */}
                  <span className="text-[10px] font-mono text-faint uppercase font-bold tracking-wider">
                    #{slotNumber < 10 ? `0${slotNumber}` : slotNumber}
                  </span>

                  {/* Símbolo do Checkbox / Carimbo */}
                  {isChecked ? (
                    <div className="my-1 flex flex-col items-center">
                      <span className="text-xl leading-none animate-scale-up" title="Presente">
                        🥋
                      </span>
                      <span className="text-[10px] font-mono font-bold text-gold mt-1">
                        {new Date(attendanceRecord.class_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="my-1 w-6 h-6 rounded-md border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-faint group-hover:border-gold">
                      {isInstructor && <span className="opacity-0 hover:opacity-100 text-gold font-bold">+</span>}
                    </div>
                  )}

                  {/* Status Rodapé */}
                  <span className="text-[9px] uppercase font-semibold tracking-tight text-faint">
                    {isChecked ? 'Confirmado' : 'Aguardando'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CONTEÚDO DA ABA: FOTO DA FICHA FÍSICA DE PAPEL ────────── */}
      {activeTab === 'photo' && (
        <div className="flex flex-col gap-4">
          {data.cardPhotoUrl ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Fotografia oficial da ficha de papel arquivada digitalmente.</span>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="btn btn-outline btn-sm text-xs py-1"
                >
                  🔍 Ver em Tela Cheia
                </button>
              </div>

              {/* Moldura da Foto */}
              <div
                onClick={() => setShowPhotoModal(true)}
                className="relative w-full max-h-[500px] rounded-[var(--radius-md)] border-2 border-[var(--color-border)] overflow-hidden bg-black/90 flex items-center justify-center cursor-zoom-in group shadow-md"
              >
                <img
                  src={data.cardPhotoUrl}
                  alt={`Ficha física de ${data.student.full_name}`}
                  className="w-full h-auto object-contain max-h-[480px] group-hover:scale-101 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-semibold gap-2">
                  <span>🔍 Clique para ampliar</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center flex flex-col items-center border-dashed border-2 border-[var(--color-border)]">
              <span className="text-4xl mb-2">📸</span>
              <p className="nkfs-p-m font-bold text-main">
                Nenhuma foto da ficha física anexada
              </p>
              <p className="nkfs-p-p text-muted mt-1 max-w-md">
                O instrutor pode fotografar a ficha de papel do aluno pelo celular ou computador para manter o registro visual sincronizado com o sistema.
              </p>

              {isInstructor && (
                <label className="btn btn-gold btn-sm mt-4 cursor-pointer inline-flex items-center gap-2">
                  <span>📷 Tirar Foto / Anexar Ficha</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: CONFIRMAR DESMARCAÇÃO DE PRESENÇA (INSTRUTOR) ── */}
      {selectedSlotForUncheck && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="card-elevated p-6 max-w-sm w-full flex flex-col gap-4 border border-[var(--color-border)] shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-lg shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="nkfs-p-m font-bold text-main">
                  Desmarcar Presença?
                </h3>
                <p className="text-xs text-muted">
                  Aula #{selectedSlotForUncheck.slotNumber} realizada em {selectedSlotForUncheck.date}
                </p>
              </div>
            </div>

            <p className="nkfs-p-p text-muted">
              Tem certeza que deseja remover esta presença da ficha de {data.student.full_name}?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSlotForUncheck(null)}
                className="btn btn-outline btn-sm flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUncheck}
                disabled={isPending}
                className="btn btn-danger btn-sm flex-1"
              >
                {isPending ? <Spinner size="sm" /> : 'Confirmar Remoção'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VISUALIZADOR DE FOTO EM TELA CHEIA ────────────── */}
      {showPhotoModal && data.cardPhotoUrl && (
        <div
          onClick={() => setShowPhotoModal(false)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm cursor-zoom-out"
        >
          <div className="w-full max-w-4xl flex justify-between items-center text-white mb-2 px-2">
            <span className="text-sm font-semibold">
              Ficha Física: {data.student.full_name}
            </span>
            <button
              onClick={() => setShowPhotoModal(false)}
              className="text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-bold"
            >
              ✕ Fechar
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] overflow-auto rounded-lg shadow-2xl border border-white/20 bg-black"
          >
            <img
              src={data.cardPhotoUrl}
              alt="Ficha física em alta definição"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
