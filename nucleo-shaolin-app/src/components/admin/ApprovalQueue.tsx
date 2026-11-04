'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  UserCheck,
  Award,
  Phone,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
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
  function handleReject(studentId: string, studentName?: string) {
    const confirmMsg = studentName
      ? `Recusar o cadastro de "${studentName}"?\n\nO aluno será bloqueado e não poderá reenviar um novo cadastro. Esta ação é indicada para solicitações suspeitas ou inválidas.`
      : 'Tem certeza que deseja recusar este cadastro? O aluno será bloqueado de reenviar.'

    if (!window.confirm(confirmMsg)) return

    setRejectingId(studentId)
    startTransition(async () => {
      const res = await rejectStudentRegistrationAction(studentId)
      if (res.success) {
        setPending((prev) => prev.filter((p) => p.id !== studentId))
        if (editingStudent?.id === studentId) {
          closeApprovalModal()
        }
        router.refresh()
      } else {
        alert(res.error || 'Erro ao recusar cadastro.')
      }
      setRejectingId(null)
    })
  }

  if (!pending.length) {
    return (
      <div className="card p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]/50 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-1">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-main">Nenhum cadastro pendente</h3>
        <p className="text-xs sm:text-sm text-muted max-w-sm">
          Todas as solicitações de matrícula foram analisadas e homologadas pela coordenação.
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
        })

        return (
          <div
            key={student.id}
            className="card p-4 sm:p-5 flex flex-col gap-3.5 border border-[var(--color-border)] hover:border-amber-500/40 transition-all rounded-2xl shadow-xs"
          >
            {/* Linha Principal: Identificação + Badge */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={student.full_name} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-main truncate">
                      {student.full_name}
                    </h3>
                    {!isNaN(age) && (
                      <span className="text-[11px] font-semibold text-muted px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        {age} anos
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span>{since}</span>
                    </span>
                    {student.phone && (
                      <>
                        <span>•</span>
                        <a
                          href={`https://wa.me/55${student.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-gold hover:underline"
                          title="Conversar no WhatsApp"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{student.phone}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Badge variant="warning">Aguardando Análise</Badge>
            </div>

            {/* Modalidades e Faixas declaradas — layout limpo em pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {student.student_modalities.map((sm) => (
                <div
                  key={sm.id}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-main"
                >
                  <Award className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="font-bold text-main">{sm.modality?.name ?? 'Modalidade'}:</span>
                  <span className="text-amber-500 font-semibold">
                    {sm.self_reported_level || 'Faixa Branca'}
                  </span>
                </div>
              ))}
            </div>

            {/* Ações: Recusar e Revisar/Aprovar */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]/70">
              <button
                type="button"
                onClick={() => handleReject(student.id, student.full_name)}
                disabled={isRejecting || isPending}
                className="btn btn-outline btn-sm text-error hover:bg-red-500/10 py-1.5 px-3 text-xs flex items-center gap-1.5"
                title="Recusar cadastro e bloquear reenvio"
              >
                {isRejecting ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Recusar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => openApprovalModal(student)}
                disabled={isPending || isRejecting}
                className="btn btn-gold btn-sm py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Revisar & Aprovar</span>
              </button>
            </div>
          </div>
        )
      })}

      {/* ── MODAL DE VERIFICAÇÃO E HOMOLOGAÇÃO COM EDIÇÃO ────────── */}
      {editingStudent && (
        <div className="modal-overlay animate-fade-in" onClick={closeApprovalModal}>
          <div
            className="card w-full max-w-lg p-5 sm:p-6 shadow-2xl relative animate-slide-up flex flex-col gap-4 max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-amber-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3.5">
              <div>
                <h3 className="text-lg sm:text-xl text-main font-extrabold tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-gold" />
                  <span>Homologação de Aluno</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Verifique os dados cadastrais e confirme as faixas oficiais antes de ativar a matrícula.
                </p>
              </div>
              <button
                type="button"
                onClick={closeApprovalModal}
                className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-muted hover:text-main shrink-0 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Alerta de Erro */}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Formulário de Edição Pré-Aprovação */}
            <form onSubmit={handleConfirmApproval} className="flex flex-col gap-4">
              {/* Nome Completo */}
              <div className="field">
                <label className="label text-xs sm:text-sm text-main font-bold block mb-1.5" htmlFor="edit-name">
                  Nome Completo *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="input text-xs sm:text-sm py-2 px-3 w-full rounded-xl"
                />
              </div>

              {/* Data de Nascimento e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="field">
                  <label className="label text-xs sm:text-sm text-main font-bold block mb-1.5" htmlFor="edit-birth">
                    Data de Nascimento *
                  </label>
                  <input
                    id="edit-birth"
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    required
                    className="input text-xs sm:text-sm py-2 px-3 w-full rounded-xl"
                  />
                </div>

                <div className="field">
                  <label className="label text-xs sm:text-sm text-main font-bold block mb-1.5" htmlFor="edit-phone">
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="input text-xs sm:text-sm py-2 px-3 font-mono w-full rounded-xl"
                  />
                </div>
              </div>

              {/* Homologação de Faixa por Modalidade */}
              <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-border)]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-main uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-gold" />
                    <span>Graduação Homologada</span>
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Defina a faixa correta no currículo oficial da escola para cada arte marcial solicitada.
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
                      className="p-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-main">
                          {sm.modality?.name ?? 'Modalidade'}
                        </span>
                        <span className="text-muted text-[11px]">
                          Autodeclarou: <strong className="text-amber-500 font-semibold">{sm.self_reported_level || 'Faixa Branca'}</strong>
                        </span>
                      </div>

                      {/* Dropdown de Faixas Disponíveis para a Modalidade */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-8 rounded-sm shrink-0 border border-white/20 shadow-xs"
                          style={{
                            backgroundColor: chosenGrad?.color_hex || '#D4AF37',
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
                          className="input text-xs sm:text-sm py-2 px-3 flex-1 bg-[var(--color-bg-card)] font-medium rounded-xl"
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
              <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-[var(--color-border)] mt-1">
                <button
                  type="button"
                  onClick={() => handleReject(editingStudent.id, editingStudent.full_name)}
                  disabled={isPending}
                  className="btn btn-outline text-error hover:bg-red-500/10 text-xs py-2 px-3 font-semibold"
                >
                  Recusar Cadastro
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeApprovalModal}
                    disabled={isPending}
                    className="btn btn-secondary text-xs font-semibold py-2 px-3.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn btn-gold text-xs sm:text-sm font-bold py-2 px-4 flex items-center gap-1.5 shadow-sm"
                  >
                    {isPending ? (
                      <>
                        <Spinner size="sm" />
                        <span>Homologando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprovar & Ativar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
