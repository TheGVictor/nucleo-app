import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { TechnicalSheet } from '@/components/technical/TechnicalSheet'
import { RefreshFichaButton } from '@/components/technical/RefreshFichaButton'
import { getStudentTechnicalSheetAction } from '@/app/admin/attendance/technicalActions'
import { getRequestUserProfile, getRequestStudentModalities } from '@/lib/user-cache'

interface GraduationHistoryItem {
  id: string
  promoted_at: string
  notes: string | null
  modality: { name: string } | null
  graduation: { level_name: string; color_hex: string | null } | null
}

interface AlunoFichaPageProps {
  searchParams?: Promise<{ modality?: string }>
}

export default async function AlunoFichaPage({ searchParams }: AlunoFichaPageProps) {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const resolvedParams = searchParams ? await searchParams : {}
  const targetModalityId = resolvedParams.modality

  // Carrega Perfil (deduplicado), Modalidades, Histórico de Graduações e a Ficha Técnica
  const [profile, studentModalities, gradHistoryRes, technicalSheetRes] = await Promise.all([
    getRequestUserProfile(user.id),
    getRequestStudentModalities(user.id),
    supabase
      .from('graduation_history')
      .select('*, modality:modalities(name), graduation:graduations(level_name, color_hex)')
      .eq('student_id', user.id)
      .order('promoted_at', { ascending: false }),
    getStudentTechnicalSheetAction(user.id, targetModalityId),
  ])

  if (!profile) redirect('/login')

  const graduationHistory = gradHistoryRes.data
  const technicalData = technicalSheetRes.data

  return (
    <main className="page-container py-5 flex flex-col gap-6 animate-fade-in">
      {/* ── SELETOR DE MODALIDADE (QUANDO O ALUNO TREINA MAIS DE UMA) ── */}
      {studentModalities && studentModalities.length > 1 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Suas Modalidades Marciais:
            </span>
            <span className="text-[11px] text-gold font-bold">
              {studentModalities.length} modalidades ativas
            </span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl overflow-x-auto scrollbar-none">
            {studentModalities.map((sm) => {
              const isSelected =
                (targetModalityId && sm.modality?.id === targetModalityId) ||
                (!targetModalityId && sm.modality?.name === technicalData?.modalityName)
              const icon =
                sm.modality?.slug === 'taichi'
                  ? '☯️'
                  : sm.modality?.slug === 'sanda'
                  ? '🥊'
                  : '🥋'
              return (
                <Link
                  key={sm.id}
                  href={`/aluno/ficha?modality=${sm.modality?.id}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-[var(--color-gold)] text-black shadow-xs font-extrabold'
                      : 'text-muted hover:text-main hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  <span>{sm.modality?.name}</span>
                  {sm.approved_graduation?.level_name && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-muted'
                      }`}
                    >
                      {sm.approved_graduation.level_name.replace('Faixa ', '')}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
      {/* ── CABEÇALHO DO ALUNO COM STATUS MARCIAL E TEMA DA FAIXA ── */}
      <div
        className="p-5 sm:p-6 rounded-[var(--radius-xl)] flex flex-col sm:flex-row items-center sm:items-start gap-4 relative overflow-hidden border transition-all text-center sm:text-left shadow-md"
        style={{
          background: `linear-gradient(135deg, ${technicalData?.graduationColor || '#D4AF37'}18 0%, rgba(20, 24, 33, 0.8) 100%)`,
          borderColor: `${technicalData?.graduationColor || '#D4AF37'}40`,
        }}
      >
        <Avatar name={profile.full_name} size="xl" gold />
        <div className="flex-1 min-w-0">
          <h1 className="nkfs-h-m text-main font-extrabold truncate">{profile.full_name}</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            {technicalData?.modalityName || 'Kung Fu Shaolin'} • <strong className="text-main">{technicalData?.graduationName || 'Faixa Oficial'}</strong>
          </p>
          <p className="text-xs text-faint mt-1">
            Praticante ativo desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── FICHA DE ACOMPANHAMENTO TÉCNICO OFICIAL ─────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)] gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="nkfs-h-p text-main font-bold">
              Ficha de Acompanhamento Técnico
            </h2>
            <span className="text-xs text-muted font-medium hidden sm:inline">
              ({technicalData?.graduationName || 'Faixa Oficial'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshFichaButton />
          </div>
        </div>

        {technicalData ? (
          <TechnicalSheet
            student={technicalData.student}
            initialState={technicalData.sheetState}
            isInstructor={false}
            modalityName={technicalData.modalityName}
            graduationName={technicalData.graduationName}
            graduationColor={technicalData.graduationColor}
          />
        ) : (
          <div className="card p-6 text-center">
            <p className="nkfs-p-m text-muted">Carregando ficha técnica...</p>
          </div>
        )}
      </section>

      {/* ── HISTÓRICO DE GRADUAÇÕES ─────────────────────────────── */}
      {graduationHistory && graduationHistory.length > 0 && (
        <section className="card p-5 flex flex-col gap-4">
          <div className="section-header">
            <h3 className="nkfs-h-p text-main font-bold">
              Histórico de Graduações
            </h3>
            <Badge variant="gold">{graduationHistory.length} registros</Badge>
          </div>

          <div className="flex flex-col gap-2">
            {(graduationHistory as unknown as GraduationHistoryItem[]).map((h) => (
              <div
                key={h.id}
                className="card-elevated p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-8 rounded-full shadow-xs"
                    style={{ backgroundColor: h.graduation?.color_hex ?? '#ccc' }}
                  />
                  <div>
                    <span className="nkfs-p-m font-bold text-main block">
                      {h.graduation?.level_name}
                    </span>
                    <span className="nkfs-tag-p text-muted">
                      {h.modality?.name}
                    </span>
                  </div>
                </div>
                <span className="nkfs-tag-p text-faint">
                  {new Date(h.promoted_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}