'use client'

import { useState, useEffect } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { AttendanceCard } from '@/components/attendance/AttendanceCard'
import { TechnicalSheet } from '@/components/technical/TechnicalSheet'
import {
  getStudentAttendanceCardDataAction,
  type StudentAttendanceCardData,
} from '@/app/admin/attendance/actions'
import {
  getStudentTechnicalSheetAction,
  type StudentTechnicalSheetResponse,
} from '@/app/admin/attendance/technicalActions'

export interface AttendanceStudentSummary {
  id: string
  full_name: string
  role: string
  status: string
  photo_url: string | null
  modalityName: string
  graduationName: string
  graduationColor: string
  attendanceCount: number
}

interface AttendanceManagerProps {
  initialStudents: AttendanceStudentSummary[]
}

export function AttendanceManager({ initialStudents }: AttendanceManagerProps) {
  const [students, setStudents] = useState<AttendanceStudentSummary[]>(initialStudents)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialStudents[0]?.id || null
  )
  const [viewTab, setViewTab] = useState<'technical' | 'attendance'>('technical')
  const [cardData, setCardData] = useState<StudentAttendanceCardData | null>(null)
  const [technicalData, setTechnicalData] = useState<
    NonNullable<StudentTechnicalSheetResponse['data']> | null
  >(null)
  const [loadingCard, setLoadingCard] = useState(!!initialStudents[0]?.id)
  const [search, setSearch] = useState('')

  // Carrega dados da ficha técnica e presença do aluno selecionado
  useEffect(() => {
    let isMounted = true

    if (selectedStudentId) {
      Promise.all([
        getStudentAttendanceCardDataAction(selectedStudentId),
        getStudentTechnicalSheetAction(selectedStudentId),
      ]).then(([attRes, techRes]) => {
        if (isMounted) {
          if (attRes.success && attRes.data) {
            setCardData(attRes.data)
          } else {
            setCardData(null)
          }

          if (techRes.success && techRes.data) {
            setTechnicalData(techRes.data)
          } else {
            setTechnicalData(null)
          }

          setLoadingCard(false)
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [selectedStudentId])

  // Recarrega contadores do aluno após alterações
  function handleCardUpdated() {
    if (!selectedStudentId) return
    Promise.all([
      getStudentAttendanceCardDataAction(selectedStudentId),
      getStudentTechnicalSheetAction(selectedStudentId),
    ]).then(([attRes, techRes]) => {
      if (attRes.success && attRes.data) {
        setCardData(attRes.data)
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudentId
              ? { ...s, attendanceCount: attRes.data!.attendances.length }
              : s
          )
        )
      }
      if (techRes.success && techRes.data) {
        setTechnicalData(techRes.data)
      }
    })
  }

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.modalityName.toLowerCase().includes(search.toLowerCase())
  )

  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* ── PAINEL LATERAL: LISTA DE ALUNOS ──────────────────────── */}
      <div className="w-full lg:w-80 shrink-0 card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥋</span>
            <h3 className="nkfs-h-p text-main font-bold">Fichas dos Alunos</h3>
          </div>
          <Badge variant="gold">{students.length}</Badge>
        </div>

        {/* Busca rápida de aluno */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar aluno ou modalidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-xs py-2 pl-8 w-full"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
            🔍
          </span>
        </div>

        {/* Lista rolável de alunos */}
        <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s) => {
              const isSelected = s.id === selectedStudentId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id !== selectedStudentId) {
                      setSelectedStudentId(s.id)
                      setLoadingCard(true)
                    }
                  }}
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
                      <span className="text-[11px] text-faint block truncate">
                        {s.modalityName}
                      </span>
                    </div>
                  </div>

                  {/* Badge de Presenças */}
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <Badge variant={s.attendanceCount > 0 ? 'gold' : 'muted'}>
                      {s.attendanceCount} {s.attendanceCount === 1 ? 'aula' : 'aulas'}
                    </Badge>
                  </div>
                </button>
              )
            })
          ) : (
            <p className="text-xs text-muted text-center py-6">
              Nenhum aluno encontrado.
            </p>
          )}
        </div>
      </div>

      {/* ── PAINEL PRINCIPAL: FICHA DO ALUNO SELECIONADO ─────────── */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
        {selectedStudent && (
          <div className="flex items-center justify-between bg-[var(--color-bg-card)] p-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewTab('technical')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'technical'
                    ? 'bg-[var(--color-gold)] text-black shadow-xs'
                    : 'text-muted hover:text-main'
                }`}
              >
                <span>📜</span>
                <span>Ficha Técnica</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab('attendance')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'attendance'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-muted hover:text-main'
                }`}
              >
                <span>🥋</span>
                <span>Cartão de Presença</span>
              </button>
            </div>

            <span className="text-xs text-muted hidden sm:inline-block pr-2">
              Aluno: <strong className="text-main">{selectedStudent.full_name}</strong>
            </span>
          </div>
        )}

        {loadingCard ? (
          <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
            <Spinner size="lg" />
            <p className="nkfs-p-m text-muted">Carregando ficha e acompanhamento...</p>
          </div>
        ) : viewTab === 'technical' ? (
          technicalData ? (
            <TechnicalSheet
              key={`tech-${technicalData.student.id}`}
              student={technicalData.student}
              initialState={technicalData.sheetState}
              isInstructor={true}
              modalityName={technicalData.modalityName}
              graduationName={technicalData.graduationName}
              graduationColor={technicalData.graduationColor}
              onSaved={handleCardUpdated}
            />
          ) : (
            <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--color-border)]">
              <span className="text-4xl mb-2">📜</span>
              <p className="nkfs-p-m font-bold text-main">
                Selecione um aluno na lista ao lado
              </p>
              <p className="nkfs-p-p text-muted mt-1 max-w-sm">
                Edite as técnicas, anotações e autorização de exame.
              </p>
            </div>
          )
        ) : cardData ? (
          <AttendanceCard
            key={`att-${cardData.student.id}`}
            initialData={cardData}
            isInstructor={true}
            onUpdated={handleCardUpdated}
          />
        ) : (
          <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--color-border)]">
            <span className="text-4xl mb-2">📋</span>
            <p className="nkfs-p-m font-bold text-main">
              Selecione um aluno na lista ao lado
            </p>
            <p className="nkfs-p-p text-muted mt-1 max-w-sm">
              Visualize a foto da ficha física de papel e marque as presenças nos checkboxes oficiais.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
