'use client'

import { useState, useEffect, useTransition } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { TechnicalSheet } from '@/components/technical/TechnicalSheet'
import { AttendanceCard } from '@/components/attendance/AttendanceCard'
import {
  getStudentAttendanceCardDataAction,
  type StudentAttendanceCardData,
} from '@/app/admin/attendance/actions'
import {
  getStudentTechnicalSheetAction,
  type StudentTechnicalSheetResponse,
} from '@/app/admin/attendance/technicalActions'
import { sendPersonalNoticeAction } from '@/app/admin/alunos/actions'

export interface DetailedStudent {
  id: string
  full_name: string
  cpf: string | null
  phone: string | null
  birth_date: string
  photo_url: string | null
  role: string
  status: string
  guardian_name: string | null
  guardian_phone: string | null
  created_at: string
  modalityName: string
  modalityId: string
  graduationName: string
  graduationColor: string
  attendanceCount: number
}

interface StudentHubProps {
  initialStudents: DetailedStudent[]
}

export function StudentHub({ initialStudents }: StudentHubProps) {
  const [students] = useState<DetailedStudent[]>(initialStudents)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialStudents[0]?.id || null
  )
  const [search, setSearch] = useState('')
  const [filterModality, setFilterModality] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'technical' | 'attendance' | 'notice' | 'profile'>('technical')

  // Dados do aluno selecionado
  const [technicalData, setTechnicalData] = useState<
    NonNullable<StudentTechnicalSheetResponse['data']> | null
  >(null)
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceCardData | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(!!initialStudents[0]?.id)

  // Formulário de aviso individual
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeContent, setNoticeContent] = useState('')
  const [noticeSuccess, setNoticeSuccess] = useState(false)
  const [noticeError, setNoticeError] = useState<string | null>(null)
  const [isSendingNotice, startNoticeTransition] = useTransition()

  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  // Carrega Ficha Técnica e Presenças sempre que trocar de aluno
  useEffect(() => {
    let isMounted = true

    if (selectedStudentId) {
      Promise.all([
        getStudentTechnicalSheetAction(selectedStudentId),
        getStudentAttendanceCardDataAction(selectedStudentId),
      ]).then(([techRes, attRes]) => {
        if (isMounted) {
          if (techRes.success && techRes.data) {
            setTechnicalData(techRes.data)
          } else {
            setTechnicalData(null)
          }

          if (attRes.success && attRes.data) {
            setAttendanceData(attRes.data)
          } else {
            setAttendanceData(null)
          }

          setLoadingStudent(false)
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [selectedStudentId])

  function handleSelectStudent(id: string) {
    if (id === selectedStudentId) return
    setSelectedStudentId(id)
    setLoadingStudent(true)
    setNoticeSuccess(false)
    setNoticeError(null)
  }

  function handleSendNotice(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudent || !noticeTitle.trim() || !noticeContent.trim()) return

    setNoticeError(null)
    startNoticeTransition(async () => {
      const res = await sendPersonalNoticeAction(
        selectedStudent.id,
        selectedStudent.full_name,
        noticeTitle,
        noticeContent
      )

      if (res.success) {
        setNoticeSuccess(true)
        setNoticeTitle('')
        setNoticeContent('')
        setTimeout(() => setNoticeSuccess(false), 5000)
      } else {
        setNoticeError(res.error || 'Erro ao enviar aviso')
      }
    })
  }

  // Filtros
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.cpf && s.cpf.includes(search)) ||
      (s.phone && s.phone.includes(search)) ||
      s.modalityName.toLowerCase().includes(search.toLowerCase()) ||
      s.graduationName.toLowerCase().includes(search.toLowerCase())

    const matchesModality =
      filterModality === 'all' || s.modalityName.toLowerCase().includes(filterModality.toLowerCase())

    return matchesSearch && matchesModality
  })

  // Lista de modalidades únicas para o filtro rápido
  const uniqueModalities = Array.from(new Set(students.map((s) => s.modalityName)))

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* ── PAINEL ESQUERDO: CENTRAL DE BUSCA E FILTROS ──────────── */}
      <div className="w-full lg:w-84 shrink-0 flex flex-col gap-3">
        {/* Cabeçalho da Lista */}
        <div className="card p-4 flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥋</span>
              <h2 className="nkfs-h-p text-main font-bold">Buscar Alunos</h2>
            </div>
            <Badge variant="gold">{filteredStudents.length} de {students.length}</Badge>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome, faixa, telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-xs py-2.5 pl-8.5 w-full bg-[var(--color-bg-elevated)]"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
              🔍
            </span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-main"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros Rápidos por Modalidade */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterModality('all')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-bold transition-all ${
                filterModality === 'all'
                  ? 'bg-[var(--color-gold)] text-black'
                  : 'bg-[var(--color-bg-elevated)] text-muted hover:text-main'
              }`}
            >
              Todas
            </button>
            {uniqueModalities.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setFilterModality(mod)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-bold transition-all ${
                  filterModality === mod
                    ? 'bg-[var(--color-gold)] text-black'
                    : 'bg-[var(--color-bg-elevated)] text-muted hover:text-main'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>

          {/* Lista de Alunos Encontrados */}
          <div className="flex flex-col gap-1.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => {
                const isSelected = s.id === selectedStudentId
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s.id)}
                    className={`p-2.5 rounded-[var(--radius-sm)] flex items-center justify-between text-left transition-all border ${
                      isSelected
                        ? 'bg-[var(--color-primary-muted)] border-[var(--color-primary)] text-main font-semibold shadow-xs'
                        : 'border-transparent hover:bg-[var(--color-bg-elevated)] text-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={s.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-main truncate leading-tight">
                          {s.full_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: s.graduationColor }}
                          />
                          <span className="text-[11px] text-faint truncate">
                            {s.graduationName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <Badge variant={s.attendanceCount > 0 ? 'gold' : 'muted'}>
                        {s.attendanceCount} {s.attendanceCount === 1 ? 'aula' : 'aulas'}
                      </Badge>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">🔍</span>
                <p className="text-xs text-muted">Nenhum aluno encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PAINEL DIREITO: WORKSPACE COMPLETO DO ALUNO ───────────── */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
        {selectedStudent ? (
          <>
            {/* Banner de Identificação do Aluno */}
            <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[var(--color-gold)] shadow-md">
              <div className="flex items-center gap-3.5">
                <Avatar name={selectedStudent.full_name} size="lg" gold />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="nkfs-h-p text-main font-bold">
                      {selectedStudent.full_name}
                    </h1>
                    <Badge variant={selectedStudent.status === 'active' ? 'success' : 'warning'}>
                      {selectedStudent.status === 'active' ? 'Matrícula Ativa' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted mt-1 flex-wrap">
                    <span>
                      Modalidade: <strong className="text-main">{selectedStudent.modalityName}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      Faixa:
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: selectedStudent.graduationColor }}
                      />
                      <strong className="text-main">{selectedStudent.graduationName}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <Badge variant="gold">
                  {selectedStudent.attendanceCount} Presenças
                </Badge>
              </div>
            </div>

            {/* Abas de Navegação do Aluno */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-[var(--color-bg-card)] p-1.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('technical')}
                className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'technical'
                    ? 'bg-[var(--color-gold)] text-black shadow-xs'
                    : 'text-muted hover:text-main'
                }`}
              >
                <span>📜</span>
                <span>Ficha Técnica</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('attendance')}
                className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'attendance'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-muted hover:text-main'
                }`}
              >
                <span>🥋</span>
                <span>Presenças & Frequência</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notice')}
                className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'notice'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-muted hover:text-main'
                }`}
              >
                <span>📢</span>
                <span>Aviso Personalizado</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-muted hover:text-main'
                }`}
              >
                <span>👤</span>
                <span>Dados Cadastrais</span>
              </button>
            </div>

            {/* Conteúdo da Aba Selecionada */}
            {loadingStudent ? (
              <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
                <Spinner size="lg" />
                <p className="nkfs-p-m text-muted">Carregando dados de {selectedStudent.full_name}...</p>
              </div>
            ) : activeTab === 'technical' ? (
              technicalData ? (
                <TechnicalSheet
                  key={`tech-${technicalData.student.id}`}
                  student={technicalData.student}
                  initialState={technicalData.sheetState}
                  isInstructor={true}
                  modalityName={technicalData.modalityName}
                  graduationName={technicalData.graduationName}
                  graduationColor={technicalData.graduationColor}
                  onSaved={() => {
                    // Recarrega dados atualizados
                    getStudentTechnicalSheetAction(selectedStudent.id).then((res) => {
                      if (res.success && res.data) setTechnicalData(res.data)
                    })
                  }}
                />
              ) : (
                <div className="card p-12 text-center text-muted">
                  Não foi possível carregar a ficha técnica do aluno.
                </div>
              )
            ) : activeTab === 'attendance' ? (
              attendanceData ? (
                <AttendanceCard
                  key={`att-${attendanceData.student.id}`}
                  initialData={attendanceData}
                  isInstructor={true}
                  onUpdated={() => {
                    getStudentAttendanceCardDataAction(selectedStudent.id).then((res) => {
                      if (res.success && res.data) setAttendanceData(res.data)
                    })
                  }}
                />
              ) : (
                <div className="card p-12 text-center text-muted">
                  Não foi possível carregar as presenças do aluno.
                </div>
              )
            ) : activeTab === 'notice' ? (
              /* Formulário de Envio de Aviso Direto */
              <div className="card p-6 flex flex-col gap-4 shadow-md max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border)]">
                  <span className="text-2xl">📢</span>
                  <div>
                    <h3 className="nkfs-h-p text-main font-bold">
                      Enviar Recado Direto para {selectedStudent.full_name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Este aviso será exibido no portal e mural de avisos do aluno com destaque personalizado.
                    </p>
                  </div>
                </div>

                {noticeSuccess && (
                  <div className="p-3 rounded-[var(--radius-md)] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <span>✓</span>
                    <span>Recado enviado com sucesso para o aluno!</span>
                  </div>
                )}
                {noticeError && (
                  <div className="p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <span>⚠️</span>
                    <span>{noticeError}</span>
                  </div>
                )}

                <form onSubmit={handleSendNotice} className="flex flex-col gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-main block mb-1">
                      Assunto / Título do Recado:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Treino extra de Kati, Correção de base, Exame de faixa..."
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      className="input text-xs py-2.5 w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-main block mb-1">
                      Mensagem / Observação Técnica:
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Escreva a mensagem personalizada para o aluno..."
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      className="w-full text-xs p-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-main focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSendingNotice}
                      className="btn btn-gold btn-sm text-xs font-bold flex items-center gap-2"
                    >
                      {isSendingNotice ? (
                        <>
                          <Spinner size="sm" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <span>📨</span>
                          <span>Enviar Recado ao Aluno</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Aba de Dados Cadastrais */
              <div className="card p-6 flex flex-col gap-5 shadow-md max-w-2xl mx-auto w-full">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    <h3 className="nkfs-h-p text-main font-bold">Dados Cadastrais do Aluno</h3>
                  </div>
                  <Badge variant={selectedStudent.status === 'active' ? 'success' : 'warning'}>
                    {selectedStudent.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-muted block text-[11px]">Nome Completo</span>
                    <strong className="text-main font-semibold text-sm">{selectedStudent.full_name}</strong>
                  </div>

                  <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-muted block text-[11px]">Telefone / WhatsApp</span>
                    <strong className="text-main font-semibold text-sm">{selectedStudent.phone || 'Não informado'}</strong>
                  </div>

                  <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-muted block text-[11px]">CPF</span>
                    <strong className="text-main font-semibold text-sm">{selectedStudent.cpf || 'Não informado'}</strong>
                  </div>

                  <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-muted block text-[11px]">Data de Nascimento</span>
                    <strong className="text-main font-semibold text-sm">
                      {selectedStudent.birth_date ? new Date(selectedStudent.birth_date).toLocaleDateString('pt-BR') : 'Não informada'}
                    </strong>
                  </div>

                  {selectedStudent.guardian_name && (
                    <>
                      <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-muted block text-[11px]">Responsável Legal</span>
                        <strong className="text-main font-semibold">{selectedStudent.guardian_name}</strong>
                      </div>
                      <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                        <span className="text-muted block text-[11px]">Contato do Responsável</span>
                        <strong className="text-main font-semibold">{selectedStudent.guardian_phone || '—'}</strong>
                      </div>
                    </>
                  )}

                  <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] sm:col-span-2">
                    <span className="text-muted block text-[11px]">Data de Matrícula</span>
                    <strong className="text-main font-semibold">
                      {new Date(selectedStudent.created_at).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--color-border)]">
            <span className="text-4xl mb-2">👥</span>
            <p className="nkfs-p-m font-bold text-main">
              Selecione um aluno na lista ao lado
            </p>
            <p className="nkfs-p-p text-muted mt-1 max-w-sm">
              Pesquise ou selecione qualquer praticante para preencher a ficha técnica, registrar presenças ou enviar um recado direto.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
