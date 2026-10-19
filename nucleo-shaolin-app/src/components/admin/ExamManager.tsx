'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Avatar } from '@/components/ui/Avatar'
import {
  createExamListAction,
  updateExamListStatusAction,
  type DetailedExamList,
} from '@/app/admin/exames/actions'

interface ModalityOption {
  id: string
  name: string
  slug: string
}

interface GraduationOption {
  id: string
  modality_id: string
  level_name: string
  level_order: number
  color_hex: string | null
}

export interface StudentCandidateModality {
  modality_id: string
  modality_name: string
  current_graduation_id: string | null
  graduation_name: string
  graduation_color?: string
  level_order: number
}

export interface StudentCandidateOption {
  id: string
  full_name: string
  modalities: StudentCandidateModality[]
}

interface ExamManagerProps {
  initialLists: DetailedExamList[]
  modalities: ModalityOption[]
  graduations: GraduationOption[]
  students: StudentCandidateOption[]
  currentUserRole: string
  currentUserId: string
}

export function ExamManager({
  initialLists,
  modalities,
  graduations,
  students,
  currentUserRole,
  currentUserId,
}: ExamManagerProps) {
  const isSifu = currentUserRole === 'super_admin'

  const [lists, setLists] = useState<DetailedExamList[]>(initialLists)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all')
  const [expandedListId, setExpandedListId] = useState<string | null>(
    initialLists.find((l) => l.status === 'pending')?.id || initialLists[0]?.id || null
  )

  // Estado do Modal de Criação
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formModalityId, setFormModalityId] = useState(modalities[0]?.id || '')
  const [formNotes, setFormNotes] = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  // Candidatos selecionados: Map de studentId -> { targetGraduationId, notes }
  const [selectedCandidates, setSelectedCandidates] = useState<
    Record<string, { targetGraduationId: string; notes: string }>
  >({})

  // Transitions & Feedback
  const [isSubmitting, startSubmitTransition] = useTransition()
  const [isUpdatingStatus, startStatusTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function openCreateModal() {
    const initialModId = modalities[0]?.id || ''
    setFormTitle(`Exame de Faixa - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`)
    setFormModalityId(initialModId)
    setFormNotes('')
    setStudentSearch('')
    setSelectedCandidates({})
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setErrorMessage(null)
  }

  // Ao trocar a modalidade do exame, atualiza ou limpa candidatos que não praticam aquela modalidade
  function handleModalityChange(newModalityId: string) {
    setFormModalityId(newModalityId)
    const newModGrads = graduations
      .filter((g) => g.modality_id === newModalityId)
      .sort((a, b) => a.level_order - b.level_order)

    setSelectedCandidates((prev) => {
      const next: Record<string, { targetGraduationId: string; notes: string }> = {}
      for (const studentId of Object.keys(prev)) {
        const student = students.find((s) => s.id === studentId)
        const studentMod = student?.modalities.find((m) => m.modality_id === newModalityId)
        
        // Mantém apenas os alunos que praticam a modalidade recém selecionada
        if (studentMod) {
          const higherGrad = newModGrads.find((g) => g.level_order > studentMod.level_order)
          const targetGradId = higherGrad ? higherGrad.id : newModGrads[0]?.id || ''
          next[studentId] = {
            targetGraduationId: targetGradId,
            notes: prev[studentId].notes,
          }
        }
      }
      return next
    })
  }

  // Filtragem de alunos no modal:
  // Só exibe alunos que praticam a modalidade selecionada no formulário (CLF, Sanda, Tai Chi, etc.)
  const filteredStudents = students.filter((s) => {
    if (formModalityId) {
      const practicesMod = s.modalities.some((m) => m.modality_id === formModalityId)
      if (!practicesMod) return false
    }

    if (!studentSearch.trim()) return true
    const q = studentSearch.toLowerCase()
    const activeMod = s.modalities.find((m) => m.modality_id === formModalityId) || s.modalities[0]

    return (
      s.full_name.toLowerCase().includes(q) ||
      (activeMod?.graduation_name && activeMod.graduation_name.toLowerCase().includes(q))
    )
  })

  // Graduações disponíveis para a modalidade do formulário
  const availableGraduations = graduations
    .filter((g) => !formModalityId || g.modality_id === formModalityId)
    .sort((a, b) => a.level_order - b.level_order)

  function toggleStudentSelection(student: StudentCandidateOption) {
    setSelectedCandidates((prev) => {
      const next = { ...prev }
      if (next[student.id]) {
        delete next[student.id]
      } else {
        // Encontra a graduação atual do aluno na modalidade selecionada
        const studentMod = student.modalities.find((m) => m.modality_id === formModalityId) || student.modalities[0]
        
        let nextGradId = ''
        if (studentMod && studentMod.level_order !== undefined) {
          const higherGrad = availableGraduations.find((g) => g.level_order > studentMod.level_order)
          nextGradId = higherGrad ? higherGrad.id : availableGraduations[availableGraduations.length - 1]?.id || ''
        } else {
          nextGradId = availableGraduations[0]?.id || ''
        }

        next[student.id] = {
          targetGraduationId: nextGradId,
          notes: '',
        }
      }
      return next
    })
  }

  function handleCandidateGraduationChange(studentId: string, gradId: string) {
    setSelectedCandidates((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        targetGraduationId: gradId,
      },
    }))
  }

  function handleCandidateNotesChange(studentId: string, notes: string) {
    setSelectedCandidates((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }))
  }

  function handleSelectAllFiltered() {
    const next = { ...selectedCandidates }
    filteredStudents.forEach((student) => {
      if (!next[student.id]) {
        const studentMod = student.modalities.find((m) => m.modality_id === formModalityId) || student.modalities[0]
        let nextGradId = ''
        if (studentMod && studentMod.level_order !== undefined) {
          const higherGrad = availableGraduations.find((g) => g.level_order > studentMod.level_order)
          nextGradId = higherGrad ? higherGrad.id : availableGraduations[availableGraduations.length - 1]?.id || ''
        } else {
          nextGradId = availableGraduations[0]?.id || ''
        }
        next[student.id] = {
          targetGraduationId: nextGradId,
          notes: '',
        }
      }
    })
    setSelectedCandidates(next)
  }

  function handleClearSelection() {
    setSelectedCandidates({})
  }

  // Enviar lista ao Sifu
  function handleSubmitExamList(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) {
      setErrorMessage('Informe o título da lista de exame.')
      return
    }

    const candidateIds = Object.keys(selectedCandidates)
    if (candidateIds.length === 0) {
      setErrorMessage('Selecione ao menos um aluno para compor a lista de exame.')
      return
    }

    setErrorMessage(null)
    startSubmitTransition(async () => {
      const candidatesPayload = candidateIds.map((id) => ({
        studentId: id,
        targetGraduationId: selectedCandidates[id].targetGraduationId || null,
        notes: selectedCandidates[id].notes || null,
      }))

      const res = await createExamListAction({
        title: formTitle,
        modalityId: formModalityId || null,
        notes: formNotes || null,
        candidates: candidatesPayload,
      })

      if (res.success) {
        setSuccessMessage('Lista de exame enviada com sucesso para avaliação do Sifu!')
        setIsModalOpen(false)
        // Atualiza estado local da lista
        const newListItem: DetailedExamList = {
          id: res.listId || Math.random().toString(),
          title: formTitle,
          modality_id: formModalityId,
          instructor_id: currentUserId,
          notes: formNotes,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          instructor: { full_name: 'Você', photo_url: null },
          modality: modalities.find((m) => m.id === formModalityId) || null,
          candidatesCount: candidateIds.length,
          candidates: candidateIds.map((id) => {
            const student = students.find((s) => s.id === id)
            const targetGrad = graduations.find(
              (g) => g.id === selectedCandidates[id].targetGraduationId
            )
            return {
              id: Math.random().toString(),
              student_id: id,
              target_graduation_id: selectedCandidates[id].targetGraduationId,
              instructor_notes: selectedCandidates[id].notes,
              student: student ? { full_name: student.full_name, photo_url: null } : null,
              target_graduation: targetGrad
                ? { level_name: targetGrad.level_name, color_hex: targetGrad.color_hex }
                : null,
            }
          }),
        }
        setLists((prev) => [newListItem, ...prev])
        setExpandedListId(newListItem.id)
      } else {
        setErrorMessage(res.error || 'Erro ao submeter lista de exame.')
      }
    })
  }

  // Sifu homologa ou atualiza status
  function handleUpdateStatus(examListId: string, newStatus: 'approved' | 'pending') {
    const actionLabel = newStatus === 'approved' ? 'aprovar e homologar' : 'reabrir'
    if (!confirm(`Deseja realmente ${actionLabel} esta lista de exame?`)) return

    startStatusTransition(async () => {
      const res = await updateExamListStatusAction(examListId, newStatus)
      if (res.success) {
        setLists((prev) =>
          prev.map((l) => (l.id === examListId ? { ...l, status: newStatus } : l))
        )
      } else {
        alert(res.error || 'Erro ao alterar status da lista de exame.')
      }
    })
  }

  // Filtragem das listas
  const filteredLists = lists.filter((l) => {
    if (filterStatus === 'pending') return l.status === 'pending'
    if (filterStatus === 'approved') return l.status === 'approved'
    return true
  })

  const pendingListsCount = lists.filter((l) => l.status === 'pending').length
  const approvedListsCount = lists.filter((l) => l.status === 'approved').length

  const selectedModalityName = modalities.find((m) => m.id === formModalityId)?.name || 'Modalidade'

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── BANNER / RESUMO DE LISTAS DE EXAME ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-bg-card)] p-5 sm:p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🥋</span>
            <h2 className="nkfs-h-p text-main font-bold">
              {isSifu ? 'Listas de Exame Enviadas ao Sifu' : 'Banca de Exame de Graduação'}
            </h2>
          </div>
          <p className="text-sm text-muted mt-1.5 max-w-xl leading-relaxed">
            {isSifu
              ? 'Analise os alunos indicados pelos instrutores, confira a graduação pretendida e homologue a aprovação oficial.'
              : 'Selecione os alunos aptos da sua turma, escolha a próxima faixa e envie a proposta de exame diretamente ao Sifu.'}
          </p>
        </div>

        {/* Botão de Criação */}
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-gold btn-md text-sm font-bold flex items-center justify-center gap-2 shrink-0 shadow-sm self-start sm:self-center"
        >
          <span>＋</span>
          <span>Nova Lista de Exame</span>
        </button>
      </div>

      {/* Alertas de Feedback */}
      {successMessage && (
        <div className="p-4 rounded-[var(--radius-md)] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-base">✓</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-sm hover:underline font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── FILTROS E CONTADORES ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'all'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>Todas as Listas</span>
            <span className="font-mono text-xs bg-neutral-700/60 px-2 rounded-full">
              {lists.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>Aguardando Sifu</span>
            {pendingListsCount > 0 && (
              <span className="font-mono text-xs bg-amber-800 px-2 rounded-full">
                {pendingListsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>Homologadas</span>
            <span className="font-mono text-xs bg-emerald-800 px-2 rounded-full">
              {approvedListsCount}
            </span>
          </button>
        </div>
      </div>

      {/* ── LISTAGEM DE PROPOSTAS DE EXAME ─────────────────────────── */}
      <div className="flex flex-col gap-4">
        {filteredLists.length > 0 ? (
          filteredLists.map((item) => {
            const isExpanded = expandedListId === item.id
            const isPending = item.status === 'pending'
            const isApproved = item.status === 'approved'

            return (
              <div
                key={item.id}
                className={`card p-4 sm:p-5 flex flex-col gap-3 transition-all border ${
                  isExpanded
                    ? 'border-[var(--color-gold)] shadow-md'
                    : 'hover:border-[var(--color-border-hover)]'
                }`}
              >
                {/* Linha Principal do Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedListId(isExpanded ? null : item.id)}
                      className="text-xl sm:text-2xl mt-0.5 p-1 rounded hover:bg-[var(--color-bg-elevated)] text-muted hover:text-main transition-colors shrink-0"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir candidatos'}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="nkfs-h-p text-main font-bold truncate">
                          {item.title}
                        </h3>
                        {isPending ? (
                          <Badge variant="warning">Aguardando Avaliação do Sifu</Badge>
                        ) : isApproved ? (
                          <Badge variant="success">✓ Homologado pelo Sifu</Badge>
                        ) : (
                          <Badge variant="muted">{item.status}</Badge>
                        )}
                        {item.modality && (
                          <Badge variant="gold">{item.modality.name}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-sm text-muted mt-1.5 flex-wrap">
                        <span>
                          Enviado por:{' '}
                          <strong className="text-main">
                            {item.instructor?.full_name || 'Instrutor'}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Candidatos:{' '}
                          <strong className="text-main font-mono">
                            {item.candidatesCount || item.candidates?.length || 0}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Data:{' '}
                          {new Date(item.created_at).toLocaleDateString('pt-BR', {
                            dateStyle: 'medium',
                          })}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs sm:text-sm text-muted italic mt-2 bg-[var(--color-bg-elevated)] p-2.5 rounded border border-[var(--color-border)]">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações do Sifu */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {isSifu && isPending && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(item.id, 'approved')}
                        className="btn btn-gold btn-sm text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs"
                        title="Homologar e aprovar lista de exame"
                      >
                        {isUpdatingStatus ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <span>✓</span>
                            <span>Homologar Lista</span>
                          </>
                        )}
                      </button>
                    )}

                    {isSifu && isApproved && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(item.id, 'pending')}
                        className="btn btn-ghost btn-sm text-xs sm:text-sm text-muted hover:text-amber-500"
                        title="Reabrir para revisão"
                      >
                        Reabrir
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedListId(isExpanded ? null : item.id)}
                      className="btn btn-secondary btn-sm text-xs sm:text-sm"
                    >
                      {isExpanded ? 'Ocultar Candidatos' : 'Ver Candidatos'}
                    </button>
                  </div>
                </div>

                {/* ── EXPANSÃO: LISTA DE CANDIDATOS DO EXAME ───────────── */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[var(--color-border)] mt-2 flex flex-col gap-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-main">
                        Alunos Indicados nesta Proposta ({item.candidates?.length || 0}):
                      </span>
                    </div>

                    {item.candidates && item.candidates.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.candidates.map((c) => (
                          <div
                            key={c.id || c.student_id}
                            className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2.5 text-xs sm:text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar name={c.student?.full_name || 'Aluno'} size="sm" />
                              <div className="min-w-0">
                                <p className="font-bold text-main truncate leading-tight">
                                  {c.student?.full_name || 'Aluno'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-xs text-muted">Faixa pretendida:</span>
                                  <span className="font-semibold text-main flex items-center gap-1">
                                    {c.target_graduation?.color_hex && (
                                      <span
                                        className="w-2.5 h-2.5 rounded-full inline-block"
                                        style={{ backgroundColor: c.target_graduation.color_hex }}
                                      />
                                    )}
                                    {c.target_graduation?.level_name || 'Próxima Graduação'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {c.instructor_notes && (
                              <div className="bg-[var(--color-bg-card)] p-2.5 rounded text-xs text-muted border border-[var(--color-border)]">
                                <strong className="text-main block mb-1">Nota do Instrutor:</strong>
                                {c.instructor_notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs sm:text-sm text-muted">
                        Nenhum detalhe de candidato salvo nesta lista.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="card p-12 text-center flex flex-col items-center justify-center text-muted">
            <span className="text-4xl mb-2">📋</span>
            <p className="nkfs-p-m font-bold text-main">
              Nenhuma lista de exame encontrada
            </p>
            <p className="text-sm text-muted mt-1 max-w-sm">
              {isSifu
                ? 'Nenhum instrutor enviou propostas de exame pendentes no momento.'
                : 'Clique em "Nova Lista de Exame" para selecionar seus alunos e submeter a proposta ao Sifu.'}
            </p>
          </div>
        )}
      </div>

      {/* ── MODAL: NOVA LISTA DE EXAME (MULTI-SELECT COM BUSCA) ─────── */}
      {isModalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-2xl p-6 sm:p-7 flex flex-col gap-5 max-h-[92vh] overflow-y-auto animate-fade-in"
          >
            {/* Cabeçalho do Modal com Tipografia Ampla */}
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥋</span>
                <div>
                  <h3 className="text-lg sm:text-xl text-main font-extrabold tracking-tight">
                    Criar Lista de Exame para o Sifu
                  </h3>
                  <p className="text-xs sm:text-sm text-muted mt-0.5">
                    Selecione a modalidade, filtre os praticantes e indique a próxima faixa para homologação.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted hover:text-main text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              >
                ✕ Fechar
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitExamList} className="flex flex-col gap-5">
              {/* Título e Modalidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-main block mb-1.5">
                    Título / Identificação do Exame:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Exame de Faixa - Dezembro 2026"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="input text-sm py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-sm text-main block mb-1.5">
                    Modalidade do Exame:
                  </label>
                  <select
                    value={formModalityId}
                    onChange={(e) => handleModalityChange(e.target.value)}
                    className="input text-sm py-2.5 px-3.5 w-full rounded-[var(--radius-md)] font-medium"
                  >
                    {modalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Observações Gerais para o Sifu */}
              <div>
                <label className="font-bold text-sm text-main block mb-1.5">
                  Observações Gerais para o Sifu (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Turma treinando forte, foco em formas de punho e defesa pessoal..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="input text-sm py-2.5 px-3.5 w-full rounded-[var(--radius-md)]"
                />
              </div>

              {/* ── SEÇÃO DE SELEÇÃO DE ALUNOS COM BUSCA INSTANTÂNEA ── */}
              <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-sm text-main">
                    Alunos que praticam {selectedModalityName} ({Object.keys(selectedCandidates).length} selecionados):
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-xs sm:text-sm text-[var(--color-gold)] hover:underline font-bold"
                    >
                      Selecionar Filtrados ({filteredStudents.length})
                    </button>
                    <span className="text-muted">•</span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-xs sm:text-sm text-muted hover:underline"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Input de Busca com Tamanho Confortável */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Buscar praticante de ${selectedModalityName} por nome ou faixa...`}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="input text-sm sm:text-base py-3 pl-10 pr-10 w-full rounded-[var(--radius-md)]"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base">🔍</span>
                  {studentSearch && (
                    <button
                      type="button"
                      onClick={() => setStudentSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-main text-base font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Lista de Alunos da Modalidade com Checkboxes */}
                <div className="max-h-60 overflow-y-auto border border-[var(--color-border)] rounded-[var(--radius-md)] p-2.5 flex flex-col gap-1.5 bg-[var(--color-bg-elevated)]">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => {
                      const isSelected = !!selectedCandidates[s.id]
                      const studentMod = s.modalities.find((m) => m.modality_id === formModalityId) || s.modalities[0]

                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleStudentSelection(s)}
                          className={`p-3.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-primary-muted)] border border-[var(--color-primary)] font-semibold text-main shadow-xs'
                              : 'hover:bg-[var(--color-bg-card)] text-muted border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // tratado no wrapper div
                              className="w-4 h-4 sm:w-5 sm:h-5 accent-[var(--color-gold)] cursor-pointer shrink-0"
                            />
                            <span className="truncate text-sm sm:text-base text-main font-bold">{s.full_name}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-xs sm:text-sm">
                            {studentMod?.graduation_color && (
                              <span
                                className="w-3 h-3 rounded-full inline-block shadow-xs"
                                style={{ backgroundColor: studentMod.graduation_color }}
                              />
                            )}
                            <span className="text-muted font-medium">
                              {studentMod?.graduation_name || 'Iniciante'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-6 flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">🔍</span>
                      <p className="text-sm sm:text-base font-bold text-main">
                        Nenhum aluno cadastrado em {selectedModalityName}
                      </p>
                      <p className="text-xs sm:text-sm text-muted mt-1">
                        Altere a modalidade acima ou cadastre alunos nesta modalidade.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CONFIGURAÇÃO DOS CANDIDATOS SELECIONADOS ─────────── */}
              {Object.keys(selectedCandidates).length > 0 && (
                <div className="flex flex-col gap-3 pt-3.5 border-t border-[var(--color-border)]">
                  <span className="font-bold text-sm sm:text-base text-main">
                    Configurar Faixa Pretendida e Observações por Candidato:
                  </span>

                  <div className="flex flex-col gap-3.5 max-h-72 overflow-y-auto pr-1">
                    {Object.keys(selectedCandidates).map((studentId) => {
                      const student = students.find((s) => s.id === studentId)
                      const studentMod = student?.modalities.find((m) => m.modality_id === formModalityId) || student?.modalities[0]
                      const candidateData = selectedCandidates[studentId]

                      return (
                        <div
                          key={studentId}
                          className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border)] flex flex-col gap-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm sm:text-base text-main">
                                {student?.full_name || 'Aluno'}
                              </span>
                              <span className="text-xs sm:text-sm text-muted">
                                (Atual: {studentMod?.graduation_name})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => student && toggleStudentSelection(student)}
                              className="text-xs sm:text-sm text-red-500 font-bold hover:underline"
                            >
                              Remover
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-sm font-bold text-main block mb-1.5">
                                Faixa Pretendida ({selectedModalityName}):
                              </label>
                              <select
                                value={candidateData.targetGraduationId}
                                onChange={(e) =>
                                  handleCandidateGraduationChange(studentId, e.target.value)
                                }
                                className="input text-sm sm:text-base py-2.5 px-3.5 w-full font-medium"
                              >
                                {availableGraduations.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.level_name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-bold text-main block mb-1.5">
                                Observação Técnica do Instrutor:
                              </label>
                              <input
                                type="text"
                                placeholder="Ex: Formas e base aprovadas, ótimo foco..."
                                value={candidateData.notes}
                                onChange={(e) =>
                                  handleCandidateNotesChange(studentId, e.target.value)
                                }
                                className="input text-sm sm:text-base py-2.5 px-3.5 w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Botões do Rodapé */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary text-sm font-semibold py-2.5 px-5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(selectedCandidates).length === 0}
                  className="btn btn-gold text-sm font-bold flex items-center gap-2 py-2.5 px-6 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" />
                      <span>Enviando Proposta...</span>
                    </>
                  ) : (
                    <>
                      <span>📨</span>
                      <span>Enviar Lista ao Sifu</span>
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
