'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

interface PendingModality {
  id: string
  self_reported_level: string | null
  status: string
  modality: { id: string; name: string; slug: string } | null
}

interface PendingStudent {
  id: string
  full_name: string
  birth_date: string
  created_at: string
  student_modalities: PendingModality[]
}

export function ApprovalQueue({ initialPending }: { initialPending: PendingStudent[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [pending, setPending] = useState(initialPending)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleApprove(student: PendingStudent) {
    setLoading(student.id)

    // Ativa o profile
    await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', student.id)

    // Ativa todas as student_modalities do aluno
    await supabase
      .from('student_modalities')
      .update({ status: 'active' })
      .eq('student_id', student.id)

    setPending(prev => prev.filter(p => p.id !== student.id))
    setLoading(null)
    router.refresh()
  }

  async function handleReject(studentId: string) {
    setLoading(studentId)

    await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', studentId)

    setPending(prev => prev.filter(p => p.id !== studentId))
    setLoading(null)
    router.refresh()
  }

  if (!pending.length) {
    return (
      <div className="card">
        <div className="empty-state">
          <span className="empty-state-icon">✅</span>
          <p className="empty-state-title">Nenhum cadastro pendente</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-faint)' }}>
            Todos os cadastros foram analisados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {pending.map(student => {
        const isLoading = loading === student.id
        const age = new Date().getFullYear() - new Date(student.birth_date).getFullYear()
        const since = new Date(student.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit', month: 'short', year: 'numeric',
        })

        return (
          <div key={student.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Cabeçalho */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <Avatar name={student.full_name} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="nkfs-p-m font-semibold text-main">
                  {student.full_name}
                </p>
                <p className="nkfs-tag-p text-muted">
                  {age} anos · Cadastro em {since}
                </p>
              </div>
              <Badge variant="warning">Pendente</Badge>
            </div>

            {/* Modalidades */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p className="label nkfs-tag-p text-muted">Modalidades solicitadas</p>
              {student.student_modalities.map(sm => (
                <div
                  key={sm.id}
                  className="card-elevated"
                  style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <p className="nkfs-p-p font-semibold text-main">
                      {sm.modality?.name ?? '—'}
                    </p>
                    <p className="nkfs-tag-p text-muted mt-0.5">
                      Autodeclarado: {sm.self_reported_level ?? 'Não informado'}
                    </p>
                  </div>
                  <Badge variant="muted">{sm.modality?.slug?.toUpperCase()}</Badge>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button
                onClick={() => handleReject(student.id)}
                disabled={!!isLoading}
                className="btn btn-danger btn-sm"
                style={{ flex: 1 }}
              >
                {isLoading ? <Spinner /> : 'Recusar'}
              </button>
              <button
                onClick={() => handleApprove(student)}
                disabled={!!isLoading}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {isLoading ? <Spinner /> : '✓ Aprovar Cadastro'}
              </button>
            </div>

          </div>
        )
      })}
    </div>
  )
}