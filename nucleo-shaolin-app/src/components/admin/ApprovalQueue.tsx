'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  approveStudentWithEditsAction,
  rejectStudentRegistrationAction,
  type StudentApprovalData,
} from '@/app/admin/alunos/actions'

export interface GraduationOption {
  id: string
  modality_id: string
  level_name: string
  level_order: number
  color_hex: string | null
}

export interface PendingModality {
  id: string
  self_reported_level: string | null
  status: string
  modality: { id: string; name: string; slug: string } | null
}

export interface PendingStudent {
  id: string
  full_name: string
  cpf?: string | null
  phone?: string | null
  birth_date: string
  created_at: string
  student_modalities: PendingModality[]
}

interface ApprovalQueueProps {
  initialPending: PendingStudent[]
  graduations?: GraduationOption[]
}

export function ApprovalQueue({
  initialPending,
  graduations = [],
}: ApprovalQueueProps) {
  const router = useRouter()

  const [pending, setPending] = useState<PendingStudent[]>(initialPending)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  // Estado do Modal de Verificação / Edição
  const [editingStudent, setEditingStudent] = useState<PendingStudent | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [selectedGraduations, setSelectedGraduations] = useState<Record<string, string>>({})
  const [modalError, setModalError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Abre modal de aprovação/edição pré-preenchendo dados e encontrando a faixa mais provável
  function openApprovalModal(student: PendingStudent) {
    setEditingStudent(student)
    setEditFullName(student.full_name)
    setEditBirthDate(student.birth_date ? student.birth_date.slice(0, 10) : '')
    setEditPhone(student.phone || '')
    setModalError(null)

    // Mapeia faixa sugerida inicial para cada modalidade do aluno
    const initialGrads: Record<string, string> = {}
    student.student_modalities.forEach((sm) => {
      if (!sm.modality?.id) return
      const modalityGrads = graduations.filter((g) => g.modality_id === sm.modality?.id)

      if (modalityGrads.length > 0) {
        if (sm.self_reported_level) {
          const norm = sm.self_reported_level.toLowerCase().trim()
          const match =
            modalityGrads.find((g) => g.level_name.toLowerCase().trim() === norm) ||
            modalityGrads.find((g) => norm.startsWith(g.level_name.toLowerCase().trim())) ||
            modalityGrads.find(
              (g) =>
                g.level_name.toLowerCase().includes(norm) ||
                norm.includes(g.level_name.toLowerCase())
            )
          initialGrads[sm.id] = match ? match.id : modalityGrads[0].id
        } else {
          // Se não autodeclarou, sugere a faixa inicial (menor level_order)
          initialGrads[sm.id] = modalityGrads[0].id
        }
      }
    })

    setSelectedGraduations(initialGrads)
  }

  function closeApprovalModal() {
    setEditingStudent(null)
    setModalError(null)
  }

  // Confirmação de Aprovação com dados corrigidos pelo admin
  function handleConfirmApproval(e: React.FormEvent) {
    e.preventDefault()
    if (!editingStudent) return

    if (!editFullName.trim()) {
      setModalError('O nome do aluno não pode ficar vazio.')
      return
    }

    startTransition(async () => {
      const modalitiesPayload = editingStudent.student_modalities.map((sm) => {
        const gradId = selectedGraduations[sm.id]
        const gradObj = graduations.find((g) => g.id === gradId)
        return {
          id: sm.id,
          modalityId: sm.modality?.id || '',
          graduationId: gradId || '',
          levelName: gradObj?.level_name,
        }
      })

      const payload: StudentApprovalData = {
        studentId: editingStudent.id,
        fullName: editFullName.trim(),
        birthDate: editBirthDate,
        phone: editPhone.trim() || null,
        modalities: modalitiesPayload,
      }

      const res = await approveStudentWithEditsAction(payload)

      if (res.success) {
        setPending((prev) => prev.filter((p) => p.id !== editingStudent.id))
        closeApprovalModal()
        router.refresh()
      } else {
        setModalError(res.error || 'Erro ao homologar cadastro.')
      }
    })
  }

  // Recusa direta de cadastro
  function handleReject(studentId: string) {
    if (!window.confirm('Tem certeza que deseja recusar este cadastro?')) return

    setRejectingId(studentId)
    startTransition(async () => {
      const res = await rejectStudentRegistrationAction(studentId)
      if (res.success) {
        setPending((prev) => prev.filter((p) => p.id !== studentId))
        router.refresh()
      } else {
        alert(res.error || 'Erro ao recusar cadastro.')
      }
      setRejectingId(null)
    })
  }

  if (!pending.length) {
    return (
      <div className="card p-8 text-center flex flex-col items-center justify-center">
        <span className="text-3xl mb-2">✅</span>
        <p className="nkfs-h-p font-bold text-main">Nenhum cadastro pendente</p>
        <p className="nkfs-p-m text-muted mt-1">
          Todos os cadastros foram homologados e analisados pelo Sifu.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {pending.map((student) => {
        const isRejecting = rejectingId === student.id
        const age = new Date().getFullYear() - new Date(student.birth_date).getFullYear()
        const since = new Date(student.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

        return (
          <div
            key={student.id}
            className="card p-4 sm:p-5 flex flex-col gap-4 border border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all"
          >
            {/* Cabeçalho do Aluno */}
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar name={student.full_name} size="md" />
                <div>
                  <h3 className="nkfs-h-p text-main font-bold leading-tight">
                    {student.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted mt-0.5 flex-wrap">
                    <span>{isNaN(age) ? '—' : `${age} anos`}</span>
                    <span>•</span>
                    <span>Cadastro em {since}</span>
                    {student.phone && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-faint">📱 {student.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Badge variant="warning">Aguardando Homologação</Badge>
            </div>

            {/* Modalidades Solicitadas com Faixas Informadas */}
            <div className="flex flex-col gap-2 bg-[var(--color-bg-elevated)] p-3 rounded-[var(--radius-md)] border border-[var(--color-border)]">
              <span className="text-xs font-bold text-main uppercase tracking-wider block">
                Modalidades & Níveis Informados pelo Praticante:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {student.student_modalities.map((sm) => (
                  <div
                    key={sm.id}
                    className="p-2.5 rounded bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-main truncate">
                        {sm.modality?.name ?? 'Kung Fu'}
                      </p>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        Informou:{' '}
                        <strong className="text-amber-500">
                          {sm.self_reported_level ?? 'Não informado'}
                        </strong>
                      </p>
                    </div>
                    <Badge variant="muted">
                      {sm.modality?.slug?.toUpperCase() ?? 'MOD'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações: Recusar e Verificar/Aprovar com Edição */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => handleReject(student.id)}
                disabled={isRejecting || isPending}
                className="btn btn-outline btn-sm text-error hover:bg-red-500/10 py-1.5 px-3 text-xs"
              >
                {isRejecting ? <Spinner size="sm" /> : 'Recusar'}
              </button>

              <button
                type="button"
                onClick={() => openApprovalModal(student)}
                disabled={isPending}
                className="btn btn-gold btn-sm flex-1 py-1.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>✏️</span>
                <span>Verificar, Corrigir & Aprovar</span>
              </button>
            </div>
          </div>
        )
      })}

      {/* ── MODAL DE VERIFICAÇÃO E HOMOLOGAÇÃO COM EDIÇÃO ────────── */}
      {editingStudent && (
        <div className="modal-overlay animate-fade-in" onClick={closeApprovalModal}>
          <div
            className="card w-full max-w-lg p-5 sm:p-6 shadow-2xl relative animate-slide-up flex flex-col gap-4 max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div>
                <h3 className="text-lg sm:text-xl text-main font-extrabold tracking-tight">
                  Homologação & Aprovação de Cadastro
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Verifique e corrija os dados e as faixas antes de aprovar a matrícula.
                </p>
              </div>
              <button
                type="button"
                onClick={closeApprovalModal}
                className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center text-muted hover:text-main shrink-0 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Alerta de Erro */}
            {modalError && (
              <div className="p-3.5 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{modalError}</span>
              </div>
            )}

            {/* Formulário de Edição Pré-Aprovação */}
            <form onSubmit={handleConfirmApproval} className="flex flex-col gap-4">
              {/* Nome Completo */}
              <div className="field">
                <label className="label text-sm sm:text-base text-main font-bold block mb-2" htmlFor="edit-name">
                  Nome Completo *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="input text-sm sm:text-base py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                />
              </div>

              {/* Data de Nascimento e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="field">
                  <label className="label text-sm sm:text-base text-main font-bold block mb-2" htmlFor="edit-birth">
                    Data de Nascimento *
                  </label>
                  <input
                    id="edit-birth"
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    required
                    className="input text-sm sm:text-base py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                  />
                </div>

                <div className="field">
                  <label className="label text-sm sm:text-base text-main font-bold block mb-2" htmlFor="edit-phone">
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="(19) 99999-9999"
                    className="input text-sm sm:text-base py-2.5 px-3.5 font-mono w-full rounded-[var(--radius-md)]"
                  />
                </div>
              </div>

              {/* Homologação de Faixa por Modalidade */}
              <div className="flex flex-col gap-3.5 pt-3.5 border-t border-[var(--color-border)]">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-main uppercase tracking-wider">
                    Graduação Homologada (Correção de Faixa)
                  </h4>
                  <p className="text-xs sm:text-sm text-muted mt-1">
                    Selecione a graduação correta caso o aluno tenha informado a faixa errada no cadastro.
                  </p>
                </div>

                {editingStudent.student_modalities.map((sm) => {
                  const modalityGrads = graduations.filter(
                    (g) => g.modality_id === sm.modality?.id
                  )
                  const chosenGradId = selectedGraduations[sm.id]
                  const chosenGrad = modalityGrads.find((g) => g.id === chosenGradId)

                  return (
                    <div
                      key={sm.id}
                      className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-main">
                          🥋 {sm.modality?.name ?? 'Modalidade'}
                        </span>
                        <span className="text-xs sm:text-sm text-muted">
                          Informado: <strong className="text-amber-500 font-semibold">{sm.self_reported_level || '—'}</strong>
                        </span>
                      </div>

                      {/* Dropdown de Faixas Disponíveis para a Modalidade */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-9 rounded-sm shrink-0 border border-white/20 shadow-xs"
                          style={{
                            backgroundColor: chosenGrad?.color_hex || '#CCC',
                          }}
                          title={`Cor da faixa: ${chosenGrad?.level_name}`}
                        />
                        <select
                          value={chosenGradId || ''}
                          onChange={(e) =>
                            setSelectedGraduations((prev) => ({
                              ...prev,
                              [sm.id]: e.target.value,
                            }))
                          }
                          className="input text-sm sm:text-base py-2.5 px-3.5 flex-1 bg-[var(--color-bg-card)] font-medium rounded-[var(--radius-md)]"
                        >
                          {modalityGrads.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.level_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-2">
                <button
                  type="button"
                  onClick={closeApprovalModal}
                  disabled={isPending}
                  className="btn btn-secondary text-sm font-semibold py-2.5 px-5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-gold text-sm sm:text-base font-bold py-2.5 px-6 flex items-center gap-2 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Spinner size="sm" />
                      <span>Homologando...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Homologar & Ativar Matrícula</span>
                    </>
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