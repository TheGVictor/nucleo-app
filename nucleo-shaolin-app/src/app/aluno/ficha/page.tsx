import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { TechnicalProgress } from '@/types/database'

export const instant = false

interface ProgressItem extends TechnicalProgress {
  modality: { name: string } | null
}

interface GraduationHistoryItem {
  id: string
  promoted_at: string
  notes: string | null
  modality: { name: string } | null
  graduation: { level_name: string; color_hex: string | null } | null
}

export default async function AlunoFichaPage() {
  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Avaliações técnicas do aluno com modalidade
  const { data: progress } = await supabase
    .from('technical_progress')
    .select('*, modality:modalities(name)')
    .eq('student_id', user.id)
    .order('evaluation_date', { ascending: false })

  // Histórico de graduações oficiais
  const { data: graduationHistory } = await supabase
    .from('graduation_history')
    .select('*, modality:modalities(name), graduation:graduations(level_name, color_hex)')
    .eq('student_id', user.id)
    .order('promoted_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main pb-24">
      <TopBar profile={profile} title="Ficha Técnica" />

      <main className="page-container py-5 flex flex-col gap-6 animate-fade-in">
        
        {/* ── CABEÇALHO DO ALUNO COM STATUS MARCIAL ──────────────── */}
        <div className="card-gold p-6 text-center flex flex-col items-center relative overflow-hidden shadow-gold">
          <Avatar name={profile.full_name} size="xl" gold />
          <h1 className="nkfs-h-m text-main font-extrabold mt-3">{profile.full_name}</h1>
          <p className="nkfs-p-m text-muted mt-0.5">Registro Oficial do Aluno</p>

          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <Badge variant="gold">Aluno Oficial Shaolin</Badge>
            <Badge variant="success">Matrícula Ativa</Badge>
            <span className="nkfs-tag-p text-faint">
              Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* ── CRITÉRIOS DE AVALIAÇÃO SHAOLIN ─────────────────────── */}
        <div className="card p-4.5 flex flex-col gap-2.5">
          <span className="nkfs-tag-p text-gold uppercase tracking-wider font-bold">
            Como funcionam as avaliações técnicas
          </span>
          <p className="nkfs-p-m text-muted leading-relaxed">
            As notas são atribuídas periodicamente pelo Sifu Guilherme avaliando a precisão biomecânica dos Katis, o enraizamento postural e a atitude marcial (Wu De).
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
              <span className="nkfs-tag-p text-gold block font-bold">Postura</span>
              <span className="text-xs text-muted">Bases firmes & equilíbrio</span>
            </div>
            <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
              <span className="nkfs-tag-p text-primary block font-bold">Técnica</span>
              <span className="text-xs text-muted">Forma, ângulos & precisão</span>
            </div>
            <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
              <span className="nkfs-tag-p text-success block font-bold">Foco</span>
              <span className="text-xs text-muted">Respiração & espírito</span>
            </div>
          </div>
        </div>

        {/* ── AVALIAÇÕES TÉCNICAS RECENTES ───────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="section-header">
            <div className="flex items-center gap-2">
              <h2 className="section-title nkfs-tag-m text-gold">
                Últimas Avaliações Técnicas
              </h2>
              {progress && progress.length > 0 && (
                <Badge variant="muted">{progress.length}</Badge>
              )}
            </div>
            <span className="nkfs-tag-p text-muted">Homologado pelo Sifu</span>
          </div>

          {progress && progress.length > 0 ? (
            <div className="flex flex-col gap-3">
              {(progress as unknown as ProgressItem[]).map((p) => {
                const posture = p.posture_score ?? 0
                const technique = p.technique_score ?? 0
                const focus = p.focus_score ?? 0
                const average = ((posture + technique + focus) / 3).toFixed(1)

                return (
                  <div key={p.id} className="card p-4.5 flex flex-col gap-3.5 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="nkfs-tag-m text-primary font-bold">
                          🥋 {p.modality?.name}
                        </span>
                        <Badge variant="gold">Média {average} / 5.0</Badge>
                      </div>
                      <span className="nkfs-tag-p text-faint font-mono">
                        {new Date(p.evaluation_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Barras Visuais de Pontuação */}
                    <div className="flex flex-col gap-2.5">
                      {/* Postura */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted font-medium">Postura & Base (Ma Bu / Gong Bu)</span>
                          <span className="font-bold text-gold font-mono">{posture}/5</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-500"
                            style={{ width: `${(posture / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Técnica */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted font-medium">Técnica & Execução do Kati</span>
                          <span className="font-bold text-primary font-mono">{technique}/5</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                            style={{ width: `${(technique / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Foco */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted font-medium">Foco, Respiração & Espírito Marcial</span>
                          <span className="font-bold text-success font-mono">{focus}/5</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-success)] rounded-full transition-all duration-500"
                            style={{ width: `${(focus / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Parecer do Sifu */}
                    {p.notes && (
                      <div className="card-elevated p-3 border-l-3 border-[var(--color-gold)] mt-1">
                        <span className="nkfs-tag-p text-gold uppercase tracking-wider block mb-1">
                          Observações do Mestre:
                        </span>
                        <p className="nkfs-p-m text-muted italic leading-relaxed">
                          &ldquo;{p.notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card p-8 text-center flex flex-col items-center">
              <span className="text-4xl mb-2">📋</span>
              <p className="nkfs-p-m font-bold text-main">Nenhuma avaliação técnica registrada ainda</p>
              <p className="nkfs-p-m text-muted mt-1 max-w-sm">
                As avaliações de postura, técnica e foco realizadas pelo Sifu durante os treinos serão lançadas nesta seção.
              </p>
            </div>
          )}
        </section>

        {/* ── HISTÓRICO DE GRADUAÇÕES & TROCA DE FAIXAS ─────────── */}
        <section className="flex flex-col gap-3">
          <div className="section-header">
            <h2 className="section-title nkfs-tag-m text-gold">
              Histórico de Graduações Oficiais
            </h2>
            <span className="nkfs-tag-p text-muted">Promoções Homologadas</span>
          </div>

          {graduationHistory && graduationHistory.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {(graduationHistory as unknown as GraduationHistoryItem[]).map((g) => (
                <div key={g.id} className="card-elevated p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-10 rounded-full shadow-sm shrink-0 border border-white/20"
                      style={{ backgroundColor: g.graduation?.color_hex ?? '#FFC800' }}
                    />
                    <div>
                      <span className="nkfs-tag-p text-primary block">
                        {g.modality?.name}
                      </span>
                      <span className="nkfs-p-m font-bold text-main">
                        {g.graduation?.level_name}
                      </span>
                      {g.notes && (
                        <p className="text-xs text-muted mt-0.5 italic">
                          {g.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="gold">Homologado</Badge>
                    <span className="nkfs-tag-p text-faint font-mono block mt-1">
                      {new Date(g.promoted_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center flex flex-col items-center">
              <span className="text-4xl mb-2">🥋</span>
              <p className="nkfs-p-m font-bold text-main">Aguardando primeiro exame de graduação</p>
              <p className="nkfs-p-m text-muted mt-1 max-w-sm">
                Os certificados, notas e datas das suas trocas de faixa serão salvos e arquivados permanentemente aqui.
              </p>
            </div>
          )}
        </section>

      </main>

      <BottomNav />
    </div>
  )
}