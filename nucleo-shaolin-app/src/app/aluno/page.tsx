import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsRow } from '@/components/aluno/StatsRow'
import { AnnouncementsList } from '@/components/aluno/AnnouncementsList'
import { Badge } from '@/components/ui/Badge'
import { parseAnnouncementContent } from '@/lib/announcements'
import { getRequestUserProfile, getRequestStudentModalities } from '@/lib/user-cache'
import { getCachedAnnouncements, getCachedGraduations } from '@/lib/cached-queries'

export const instant = false

export default async function AlunoHomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtém Perfil e Modalidades (deduplicados em memória do request do Layout)
  const [profile, modalities] = await Promise.all([
    getRequestUserProfile(user.id),
    getRequestStudentModalities(user.id),
  ])

  if (!profile) redirect('/login')
  if (profile.status === 'pending_approval') redirect('/aguardando')
  if (profile.status !== 'active') redirect('/login')

  const activeModality = modalities.find(m => m.status === 'active') || modalities[0]
  const activeModalityId = activeModality?.modality?.id

  // Executa consultas otimizadas:
  // - Avisos e Faixas usam cache global compartilhado em memória (Next.js Data Cache)
  // - Presenças consolidadas em 1 única query leve (em vez de 2 queries com contagem)
  const [allAnnouncements, attendanceRes, allGraduations] = await Promise.all([
    getCachedAnnouncements(),
    supabase.from('attendance').select('present').eq('student_id', user.id),
    activeModalityId ? getCachedGraduations(activeModalityId) : Promise.resolve([]),
  ])

  const attendances = attendanceRes.data ?? []
  const attendanceCount = attendances.filter((a) => a.present).length
  const totalCount = attendances.length

  // Filtra avisos: gerais, da modalidade do aluno ou destinados especificamente a um grupo/ele
  const announcements = allAnnouncements.filter((a) => {
    const { targetStudentIds } = parseAnnouncementContent(a.content)
    // Se o aviso foi destinado a um grupo específico de alunos:
    if (targetStudentIds && targetStudentIds.length > 0) {
      return targetStudentIds.includes(user.id)
    }
    // Se for individual direcionado a outro aluno, esconde
    if (a.category === 'individual') {
      return (
        a.title.includes(profile.full_name) ||
        a.content.includes(profile.full_name) ||
        a.content.includes(user.id)
      )
    }
    // Se for destinado nominalmente ou por ID ao aluno
    if (
      a.title.includes(profile.full_name) ||
      a.content.includes(profile.full_name) ||
      a.content.includes(user.id)
    ) {
      return true
    }
    // Se for da modalidade do aluno
    if (activeModalityId && a.modality_id === activeModalityId) return true
    // Se for geral da escola (sem modalidade)
    if (!a.modality_id) return true
    return false
  })

  const frequencia = totalCount
    ? Math.round((attendanceCount / totalCount) * 100)
    : null

  // Busca graduação aprovada ou faz match inteligente com a autodeclarada
  const matchedGraduation =
    activeModality?.approved_graduation ||
    (activeModality?.self_reported_level
      ? allGraduations.find(
          (g) =>
            g.level_name.toLowerCase().trim() ===
            activeModality.self_reported_level?.toLowerCase().trim()
        ) ||
        allGraduations.find((g) =>
          activeModality.self_reported_level
            ?.toLowerCase()
            .startsWith(g.level_name.toLowerCase().trim())
        ) ||
        allGraduations.find(
          (g) =>
            g.level_name
              .toLowerCase()
              .includes(activeModality.self_reported_level?.toLowerCase() || '') ||
            activeModality.self_reported_level
              ?.toLowerCase()
              .includes(g.level_name.toLowerCase())
        )
      : null)


  const graduationName =
    matchedGraduation?.level_name ??
    activeModality?.self_reported_level ??
    'Faixa Branca'
  const graduationColor = matchedGraduation?.color_hex ?? '#E2E8F0'
  const modalityName = activeModality?.modality?.name ?? 'Kung Fu Shaolin'

  // Saudação de acordo com o horário
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      {/* ── HEADER CLEAN DO ALUNO (SAUDAÇÃO, NOME E GRADUAÇÃO) ── */}
      <section className="flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted font-medium">
            {greeting},
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-main truncate tracking-tight">
            {profile.full_name}
          </h1>
        </div>

        {/* Graduação com indicador de cor */}
        <div
          className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-xs shadow-xs"
          style={{
            borderColor: `${graduationColor}50`,
            backgroundColor: `${graduationColor}15`,
            color: graduationColor,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shadow-xs shrink-0"
            style={{ backgroundColor: graduationColor }}
          />
          <span className="text-main font-bold">{graduationName}</span>
        </div>
      </section>

      {/* ── ESTATÍSTICAS RÁPIDAS (DS) ──────────────────────────── */}
      <StatsRow
        stats={[
          {
            label: 'Frequência',
            value: frequencia !== null ? `${frequencia}%` : '—',
            sub: 'Aproveitamento',
          },
          {
            label: 'Presenças',
            value: attendanceCount,
            sub: 'Aulas confirmadas',
          },
          {
            label: 'Graduação',
            value: graduationName !== '—' ? graduationName.replace('Faixa ', '') : '—',
            sub: modalityName,
          },
        ]}
      />

      {/* ── BANNER / ACESSO RÁPIDO À LOJA OFICIAL ─────────────── */}
      <Link
        href="/aluno/loja"
        prefetch={true}
        className="card p-4 sm:p-5 flex items-center justify-between gap-4 border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all group shadow-sm bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-elevated)]"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
            🛍️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-main group-hover:text-gold transition-colors truncate">
                Loja Oficial do Dojô
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 shrink-0">
                Novo
              </span>
            </div>
            <p className="text-xs text-muted truncate mt-0.5">
              Uniformes, faixas, armas e equipamentos com reserva rápida ou PIX.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-gold group-hover:translate-x-1 transition-transform">
          <span className="hidden sm:inline">Ver Produtos</span>
          <span>→</span>
        </div>
      </Link>

      {/* ── MURAL DE AVISOS INTERATIVO ─────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="section-header">
          <div className="flex items-center gap-2">
            <h2 className="nkfs-h-p text-main font-bold">Mural de Avisos</h2>
            <Badge variant="gold">{announcements.length}</Badge>
          </div>
          <span className="nkfs-tag-p text-muted">Oficial da Escola</span>
        </div>
        <div className="card p-4">
          <AnnouncementsList items={announcements} />
        </div>
      </section>
    </main>
  )
}