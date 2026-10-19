import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsRow } from '@/components/aluno/StatsRow'
import { AnnouncementsList } from '@/components/aluno/AnnouncementsList'
import { Badge } from '@/components/ui/Badge'
import { parseAnnouncementContent } from '@/lib/announcements'

export const instant = false

export default async function AlunoHomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Carrega Perfil e Modalidades em paralelo
  const [profileRes, modalitiesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('student_modalities')
      .select(`
        *,
        modality:modalities(id, name, slug),
        approved_graduation:graduations(id, level_name, level_order, color_hex)
      `)
      .eq('student_id', user.id)
      .eq('status', 'active'),
  ])

  const profile = profileRes.data
  if (!profile) redirect('/login')
  if (profile.status === 'pending_approval') redirect('/aguardando')
  if (profile.status !== 'active') redirect('/login')

  const activeModality = modalitiesRes.data?.[0]
  const activeModalityId = activeModality?.modality?.id

  // Executa em paralelo consultas de avisos, frequência e faixas
  const [
    announcementsRes,
    attendanceCountRes,
    totalCountRes,
    graduationsRes,
  ] = await Promise.all([
    supabase
      .from('announcements')
      .select('*, modality:modalities(id, name, slug)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('present', true),
    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id),
    activeModalityId
      ? supabase
          .from('graduations')
          .select('id, level_name, level_order, color_hex')
          .eq('modality_id', activeModalityId)
          .order('level_order', { ascending: true })
      : Promise.resolve({ data: [] }),
  ])

  const allAnnouncements = announcementsRes.data ?? []
  const attendanceCount = attendanceCountRes.count ?? 0
  const totalCount = totalCountRes.count ?? 0
  const allGraduations = graduationsRes.data ?? []

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

  const currentLevelOrder = matchedGraduation?.level_order ?? 0
  const nextGraduation =
    allGraduations.find((g) => g.level_order > currentLevelOrder) ?? null

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
      {/* ── CARD DE BOAS-VINDAS COM TEMA DA FAIXA DO PRATICANTE ── */}
      <section
        className="p-5 sm:p-6 rounded-[var(--radius-xl)] flex flex-col gap-4 relative overflow-hidden border transition-all"
        style={{
          background: `linear-gradient(135deg, ${graduationColor}18 0%, rgba(20, 24, 33, 0.7) 100%)`,
          borderColor: `${graduationColor}40`,
          boxShadow: `0 8px 30px ${graduationColor}12`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border"
                style={{
                  color: graduationColor,
                  borderColor: `${graduationColor}50`,
                  backgroundColor: `${graduationColor}15`,
                }}
              >
                {greeting}, {profile.full_name.split(' ')[0]} 🙏
              </span>
            </div>
            <h1 className="nkfs-h-m text-main tracking-tight font-extrabold">
              {modalityName}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Praticante oficial • <strong className="text-main">{graduationName}</strong>
            </p>
          </div>

          {/* Faixa Visual com nó marcial autêntico */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-[var(--color-bg-card)]/90 backdrop-blur-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xs">
            <div
              className="w-3.5 h-10 rounded-full shadow-md shrink-0 border border-white/20"
              style={{
                backgroundColor: graduationColor,
                boxShadow: `0 0 12px ${graduationColor}60`,
              }}
              title={`Graduação: ${graduationName}`}
            />
            <div className="min-w-0">
              <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                Graduação Atual
              </span>
              <span className="text-xs sm:text-sm font-bold text-main truncate block">
                {graduationName}
              </span>
            </div>
          </div>
        </div>

        {/* Trilha de Evolução / Próxima Faixa */}
        {nextGraduation && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted">
              <span>🎯 Próxima Graduação:</span>
              <strong className="text-main">{nextGraduation.level_name}</strong>
            </div>
            <Link
              href="/aluno/ficha"
              className="text-gold hover:underline font-bold self-start sm:self-auto text-xs"
            >
              Ver critérios na Ficha Técnica →
            </Link>
          </div>
        )}
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