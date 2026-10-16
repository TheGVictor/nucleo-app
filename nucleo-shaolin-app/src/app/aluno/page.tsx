import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { StatsRow } from '@/components/aluno/StatsRow'
import { AnnouncementsList } from '@/components/aluno/AnnouncementsList'
import { ScheduleCard } from '@/components/aluno/ScheduleCard'
import { Badge } from '@/components/ui/Badge'
import type { ClassSchedule } from '@/types/database'

export const instant = false

const DAYS_OF_WEEK = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

const SHAOLIN_WISDOM = [
  {
    title: 'Ma Bu (马步) — A Postura do Cavalo',
    quote: 'Assim como uma árvore de raízes profundas resiste à tempestade, o praticante com base sólida mantém a calma nas adversidades da vida.',
    tag: 'Fundamento Shaolin',
    icon: '🥋',
  },
  {
    title: 'Wu De (武德) — A Virtude da Perseverança',
    quote: 'A água perfura a rocha não pela sua violência, mas pela sua constância. O verdadeiro Kung Fu é construído treino a treino.',
    tag: 'Filosofia Tradicional',
    icon: '🧘',
  },
]

export default async function AlunoHomePage() {
  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Carrega Perfil e Modalidades em paralelo
  const [profileRes, modalitiesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_modalities').select(`
      *,
      modality:modalities(id, name, slug),
      approved_graduation:graduations(id, level_name, level_order, color_hex)
    `).eq('student_id', user.id).eq('status', 'active')
  ])

  const profile = profileRes.data
  if (!profile) redirect('/login')
  if (profile.status === 'pending_approval') redirect('/aguardando')
  if (profile.status !== 'active') redirect('/login')

  const activeModality = modalitiesRes.data?.[0]
  const activeModalityId = activeModality?.modality?.id

  // Executa em paralelo consultas de horários, avisos, frequência e lista de faixas
  const [schedulesRes, announcementsRes, attendanceCountRes, totalCountRes, graduationsRes] = await Promise.all([
    activeModalityId
      ? supabase.from('class_schedules').select('*').eq('modality_id', activeModalityId).eq('active', true).order('day_of_week')
      : Promise.resolve({ data: [] }),
    supabase.from('announcements')
      .select('*, modality:modalities(id, name, slug)')
      .or(`modality_id.is.null${activeModalityId ? `,modality_id.eq.${activeModalityId}` : ''}`)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', user.id).eq('present', true),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', user.id),
    activeModalityId
      ? supabase.from('graduations').select('id, level_name, level_order, color_hex').eq('modality_id', activeModalityId).order('level_order', { ascending: true })
      : Promise.resolve({ data: [] })
  ])

  const schedules = (schedulesRes.data as ClassSchedule[]) ?? []
  const announcements = announcementsRes.data ?? []
  const attendanceCount = attendanceCountRes.count ?? 0
  const totalCount = totalCountRes.count ?? 0
  const allGraduations = graduationsRes.data ?? []

  const frequencia = totalCount
    ? Math.round((attendanceCount / totalCount) * 100)
    : null

  const currentLevelOrder = activeModality?.approved_graduation?.level_order ?? 0
  const nextGraduation = allGraduations.find(g => g.level_order > currentLevelOrder) ?? null

  const graduationName = activeModality?.approved_graduation?.level_name ?? 'Faixa Branca'
  const graduationColor = activeModality?.approved_graduation?.color_hex ?? '#E2E8F0'
  const modalityName = activeModality?.modality?.name ?? 'Kung Fu Shaolin'

  // Cálculo da Próxima Aula
  const todayIndex = new Date().getDay()
  const todayClasses = schedules.filter(s => s.day_of_week === todayIndex)
  let nextClass = todayClasses[0] || null
  let nextClassDayLabel = 'Hoje'

  if (!nextClass && schedules.length > 0) {
    for (let offset = 1; offset <= 7; offset++) {
      const targetDay = (todayIndex + offset) % 7
      const found = schedules.find(s => s.day_of_week === targetDay)
      if (found) {
        nextClass = found
        nextClassDayLabel = offset === 1 ? 'Amanhã' : DAYS_OF_WEEK[targetDay]
        break
      }
    }
  }

  // Saudação de acordo com o horário
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'
  const wisdom = SHAOLIN_WISDOM[todayIndex % SHAOLIN_WISDOM.length]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main pb-24">
      <TopBar profile={profile} />

      <main className="page-container py-5 flex flex-col gap-5 animate-fade-in">

        {/* ── CARD DE BOAS-VINDAS & MODALIDADE ATIVA ─────────────── */}
        <section className="card-gold p-5 flex flex-col gap-4 shadow-gold relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="nkfs-tag-p text-gold uppercase tracking-wider font-bold">
                  {greeting}, {profile.full_name.split(' ')[0]}
                </span>
                <span className="text-xs">🙏</span>
              </div>
              <h1 className="nkfs-h-m text-main tracking-tight font-extrabold">
                {modalityName}
              </h1>
              <p className="nkfs-p-m text-muted mt-0.5">
                Nível oficial: <strong className="text-main">{graduationName}</strong>
              </p>
            </div>

            {/* Faixa Visual com efeito de nó/faixa marcial */}
            <div className="flex items-center gap-3 self-start sm:self-auto bg-[var(--color-bg-card)] px-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm">
              <div
                className="w-4 h-12 rounded-full shadow-md shrink-0 border border-white/20"
                style={{ backgroundColor: graduationColor }}
                title={`Faixa: ${graduationName}`}
              />
              <div>
                <span className="nkfs-tag-p text-faint block">Graduação Homologada</span>
                <span className="nkfs-p-m font-bold text-main">
                  {graduationName}
                </span>
              </div>
            </div>
          </div>

          {/* Trilha de Evolução / Próxima Faixa */}
          {nextGraduation && (
            <div className="pt-3 border-t border-[var(--color-border-gold)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="text-gold font-bold">🎯 Próxima Graduação:</span>
                <span className="font-semibold text-main">{nextGraduation.level_name}</span>
              </div>
              <Link
                href="/aluno/ficha"
                className="nkfs-tag-p text-gold hover:underline font-bold self-start sm:self-auto"
              >
                Ver critérios na Ficha Técnica →
              </Link>
            </div>
          )}
        </section>

        {/* ── ATALHOS RÁPIDOS (QUICK ACTIONS) ────────────────────── */}
        <section className="grid grid-cols-3 gap-2.5">
          <Link
            href="/aluno/ficha"
            className="card p-3 flex flex-col items-center text-center hover:border-[var(--color-gold)] transition-all group"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📜</span>
            <span className="nkfs-p-p font-bold text-main leading-tight">Ficha</span>
            <span className="nkfs-tag-p text-faint">Avaliações</span>
          </Link>

          <Link
            href="/aluno/videos"
            className="card p-3 flex flex-col items-center text-center hover:border-[var(--color-primary)] transition-all group"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎥</span>
            <span className="nkfs-p-p font-bold text-main leading-tight">Vídeos</span>
            <span className="nkfs-tag-p text-faint">Katis & Formas</span>
          </Link>

          <Link
            href="/aluno/perfil"
            className="card p-3 flex flex-col items-center text-center hover:border-[var(--color-border)] transition-all group"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🥋</span>
            <span className="nkfs-p-p font-bold text-main leading-tight">Perfil</span>
            <span className="nkfs-tag-p text-faint">Matrícula</span>
          </Link>
        </section>

        {/* ── PRÓXIMA AULA / DESTAQUE DO DIA ─────────────────────── */}
        {nextClass && (
          <section className="card-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[var(--color-gold)] shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold-muted)] border border-[var(--color-border-gold)] flex items-center justify-center text-gold text-lg shrink-0">
                🥋
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={nextClassDayLabel === 'Hoje' ? 'gold' : 'muted'}>
                    {nextClassDayLabel === 'Hoje' ? '⚡ Aula Hoje' : `📅 ${nextClassDayLabel}`}
                  </Badge>
                  <span className="nkfs-tag-p text-muted font-mono">
                    {nextClass.start_time.slice(0, 5)} – {nextClass.end_time.slice(0, 5)}
                  </span>
                </div>
                <h3 className="nkfs-p-m font-bold text-main mt-0.5">
                  {nextClass.title}
                </h3>
              </div>
            </div>

            <span className="nkfs-tag-p text-muted self-start sm:self-center">
              Dojô Núcleo Shaolin
            </span>
          </section>
        )}

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

        {/* ── SABEDORIA MARCIAL DO DIA (WU DE) ───────────────────── */}
        <section className="card p-4.5 bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-start gap-3.5">
          <span className="text-3xl shrink-0 mt-0.5">{wisdom.icon}</span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{wisdom.tag}</Badge>
              <span className="nkfs-tag-p font-bold text-main">{wisdom.title}</span>
            </div>
            <p className="nkfs-p-m text-muted italic leading-relaxed">
              &ldquo;{wisdom.quote}&rdquo;
            </p>
          </div>
        </section>

        {/* ── GRADE COMPLETA DA MODALIDADE ───────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="section-header">
            <h2 className="nkfs-h-p text-main font-bold">Grade Semanal de Horários</h2>
            <Badge variant="gold">{modalityName}</Badge>
          </div>
          <div className="card p-4">
            <ScheduleCard schedules={schedules} />
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}