import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { filterStudentAnnouncements } from '@/lib/announcements'
import { getRequestUserProfile, getRequestStudentModalities } from '@/lib/user-cache'
import { getCachedAnnouncements, getCachedGraduations } from '@/lib/cached-queries'
import { getBeltTheme } from '@/lib/beltTheme'

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

  const activeModality = modalities.find((m) => m.status === 'active') || modalities[0]
  const activeModalityId = activeModality?.modality?.id
  const modalityIds = modalities
    .map((m) => m.modality?.id)
    .filter((id): id is string => Boolean(id))

  const [allAnnouncements, allGraduations] = await Promise.all([
    getCachedAnnouncements(),
    activeModalityId ? getCachedGraduations(activeModalityId) : Promise.resolve([]),
  ])

  const announcements = filterStudentAnnouncements(
    allAnnouncements,
    user.id,
    profile.full_name,
    modalityIds
  )

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
  const beltTheme = getBeltTheme(graduationName, graduationColor)

  // Saudação de acordo com o horário
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'

  const latestAnnouncement = announcements[0]

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-4 sm:gap-5 animate-fade-in">
      {/* ── HEADER CLEAN DO ALUNO (SAUDAÇÃO, NOME E GRADUAÇÃO) ── */}
      <section className="flex items-center justify-between gap-3 pt-1 pb-2 border-b border-[var(--color-border)]">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted font-medium">
            {greeting},
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-main truncate tracking-tight">
            {profile.full_name}
          </h1>
          {modalities && modalities.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {modalities.map((m) => (
                <span
                  key={m.id}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-gold"
                >
                  {m.modality?.slug === 'taichi'
                    ? '☯️ '
                    : m.modality?.slug === 'sanda'
                    ? '🥊 '
                    : '🥋 '}
                  {m.modality?.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Graduação com indicador de cor e alto contraste */}
        <div
          className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-xs shadow-xs"
          style={{
            borderColor: beltTheme.badgeBorder,
            backgroundColor: beltTheme.badgeBg,
            color: beltTheme.badgeText,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shadow-xs shrink-0"
            style={{
              backgroundColor: beltTheme.dotColor,
              border: beltTheme.dotBorder ? `1px solid ${beltTheme.dotBorder}` : undefined,
            }}
          />
          <span className="font-bold">{beltTheme.label}</span>
        </div>
      </section>

      {/* ── WIDGETS PRINCIPAIS: MURAL DE AVISOS & LOJA OFICIAL ─── */}
      <section className="flex flex-col gap-3">
        {/* Widget 1: Mural de Avisos / Notificações (Mesmo padrão do Widget da Loja) */}
        <Link
          href="/aluno/avisos"
          prefetch={true}
          className="card p-4 sm:p-5 flex items-center justify-between gap-4 border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all group shadow-sm bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-elevated)]"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              🔔
              {announcements.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-gold)] text-black text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {announcements.length}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-main group-hover:text-gold transition-colors truncate">
                  Mural de Avisos
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 shrink-0">
                  {announcements.length > 0
                    ? `${announcements.length} ${announcements.length === 1 ? 'Notificação' : 'Notificações'}`
                    : 'Notificações'}
                </span>
              </div>
              <p className="text-xs text-muted truncate mt-0.5">
                {latestAnnouncement
                  ? `Último aviso: ${latestAnnouncement.title}`
                  : 'Comunicados oficiais, datas de exame, eventos e cartazes da escola.'}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-gold group-hover:translate-x-1 transition-transform">
            <span className="hidden sm:inline">Ver Avisos</span>
            <span>→</span>
          </div>
        </Link>

        {/* Widget 2: Loja Oficial da Escola */}
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
                  Loja Oficial da Escola
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
      </section>

      {/* ── ACESSO RÁPIDO DE TREINAMENTO ────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <Link
          href="/aluno/ficha"
          className="card p-4 flex flex-col justify-between gap-3 border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-lg">
              📋
            </span>
            <span className="text-xs font-bold text-gold group-hover:translate-x-0.5 transition-transform">
              Abrir →
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-main group-hover:text-gold transition-colors">
              Ficha Técnica
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-snug">
              Currículo oficial, katis, chutes e avaliações da sua faixa.
            </p>
          </div>
        </Link>

        <Link
          href="/aluno/aulas"
          className="card p-4 flex flex-col justify-between gap-3 border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-lg">
              📅
            </span>
            <span className="text-xs font-bold text-gold group-hover:translate-x-0.5 transition-transform">
              Abrir →
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-main group-hover:text-gold transition-colors">
              Grade de Aulas
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-snug">
              Dias e horários de treino das suas turmas na escola.
            </p>
          </div>
        </Link>

        <Link
          href="/aluno/videos"
          className="card p-4 flex flex-col justify-between gap-3 border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-lg">
              🎬
            </span>
            <span className="text-xs font-bold text-gold group-hover:translate-x-0.5 transition-transform">
              Abrir →
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-main group-hover:text-gold transition-colors">
              Treino em Vídeo
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-snug">
              Biblioteca de vídeos técnicos liberados para a sua graduação.
            </p>
          </div>
        </Link>
      </section>
    </main>
  )
}
