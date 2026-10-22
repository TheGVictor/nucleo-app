import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApprovalQueue } from '@/components/admin/ApprovalQueue'
import { getRequestUserProfile } from '@/lib/user-cache'

interface RawModality {
  id: string
  name: string
  slug: string
}

interface RawStudentModality {
  id: string
  self_reported_level: string | null
  status: string
  modality: RawModality | RawModality[] | null
}

export const instant = false

export default async function AdminPage() {
  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getRequestUserProfile(user.id)

  if (!profile) redirect('/login')
  if (!['instructor', 'admin', 'super_admin'].includes(profile.role)) redirect('/aluno')

  const isSifu = profile.role === 'super_admin'
  const adminClient = createAdminClient()

  // 1. Cadastros pendentes de homologação (Apenas relevante para Sifu)
  const { data: rawPending } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      cpf,
      phone,
      birth_date,
      created_at,
      student_modalities(
        id,
        status,
        self_reported_level,
        modality:modalities(id, name, slug)
      )
    `)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })

  const pending = (rawPending ?? []).map((p) => {
    const rawModalities = p.student_modalities as unknown as RawStudentModality[] | null
    const modalitiesList = Array.isArray(rawModalities) ? rawModalities : []
    const mapped = modalitiesList.map((sm) => {
      const rawMod = sm.modality
      const mod = Array.isArray(rawMod) ? rawMod[0] : rawMod
      return {
        id: sm.id,
        self_reported_level: sm.self_reported_level,
        status: sm.status,
        modality: mod ? { id: mod.id, name: mod.name, slug: mod.slug } : null,
      }
    })
    return {
      id: p.id,
      full_name: p.full_name,
      cpf: p.cpf,
      phone: p.phone,
      birth_date: p.birth_date,
      created_at: p.created_at,
      student_modalities: mapped,
    }
  })

  // 2. Contadores gerais e Graduações
  const [
    { count: activeStudents },
    { count: totalAnnouncements },
    { count: totalClasses },
    { count: pendingExamsCount },
    graduationsRes,
  ] = await Promise.all([
    adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
      .eq('status', 'active'),
    adminClient
      .from('announcements')
      .select('*', { count: 'exact', head: true }),
    adminClient
      .from('class_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('active', true),
    adminClient
      .from('exam_lists')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('graduations')
      .select('id, modality_id, level_name, level_order, color_hex')
      .order('level_order', { ascending: true }),
  ])

  const graduations = graduationsRes.data ?? []

  // Saudação de acordo com o horário
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'
  const titleName = isSifu
    ? `Sifu ${profile.full_name.split(' ')[0]}`
    : `Instrutor ${profile.full_name.split(' ')[0]}`

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      
      {/* ── HEADER CLEAN DO ADMIN (SAUDAÇÃO, NOME E CARGO) ── */}
      <section className="flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted font-medium">
            {greeting},
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-main truncate tracking-tight">
            {titleName}
          </h1>
        </div>

        {/* Badge do cargo com estética marcial */}
        <div
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-xs shadow-xs ${
            isSifu
              ? 'border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-main)]'
          }`}
        >
          <span>{isSifu ? '🥋' : '📋'}</span>
          <span>{isSifu ? 'Mestre Responsável' : 'Instrutor Autorizado'}</span>
        </div>
      </section>

      {/* ── ALERTAS DE AÇÃO PRIORITÁRIA (APENAS QUANDO HOUVER PENDÊNCIAS) ── */}
      {isSifu && (pending.length > 0 || (pendingExamsCount ?? 0) > 0) && (
        <div className="flex flex-col sm:flex-row gap-2.5">
          {pending.length > 0 && (
            <a
              href="#homologacao-alunos"
              className="flex-1 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-all text-xs sm:text-sm group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="font-semibold text-amber-500 truncate">
                  {pending.length} {pending.length === 1 ? 'aluno aguarda' : 'alunos aguardam'} homologação
                </span>
              </div>
              <span className="text-amber-500 font-bold shrink-0 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Analisar <span className="text-xs">↓</span>
              </span>
            </a>
          )}

          {(pendingExamsCount ?? 0) > 0 && (
            <Link
              href="/admin/exames"
              prefetch={true}
              className="flex-1 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition-all text-xs sm:text-sm group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="font-semibold text-red-400 truncate">
                  {pendingExamsCount} {pendingExamsCount === 1 ? 'lista de exame aguarda' : 'listas de exame aguardam'} banca
                </span>
              </div>
              <span className="text-red-400 font-bold shrink-0 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Homologar <span className="text-xs">→</span>
              </span>
            </Link>
          )}
        </div>
      )}

      {/* ── MÉTRICAS PRINCIPAIS (DASHBOARD EXECUTIVO) ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <Link
          href="/admin/alunos"
          prefetch={true}
          className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
        >
          <span className="stat-label nkfs-tag-p text-muted group-hover:text-gold transition-colors">
            Alunos Ativos
          </span>
          <span className="stat-value nkfs-h-g text-main mt-0.5">{activeStudents ?? 0}</span>
          <span className="stat-sub nkfs-p-p text-muted">Matrículas ativas</span>
        </Link>

        {isSifu ? (
          <a
            href="#homologacao-alunos"
            className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
          >
            <span className="stat-label nkfs-tag-p text-gold">Cadastros</span>
            <span className="stat-value nkfs-h-g text-gold mt-0.5">{pending.length}</span>
            <span className="stat-sub nkfs-p-p text-muted">Aguardando análise</span>
          </a>
        ) : (
          <Link
            href="/admin/exames"
            prefetch={true}
            className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
          >
            <span className="stat-label nkfs-tag-p text-gold">Exames</span>
            <span className="stat-value nkfs-h-g text-gold mt-0.5">Banca</span>
            <span className="stat-sub nkfs-p-p text-muted">Propostas ao Sifu</span>
          </Link>
        )}

        <Link
          href="/admin/exames"
          prefetch={true}
          className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
        >
          <span className="stat-label nkfs-tag-p text-primary group-hover:text-gold transition-colors">
            {isSifu ? 'Exames Pendentes' : 'Listas de Exame'}
          </span>
          <span className="stat-value nkfs-h-g text-primary mt-0.5">{pendingExamsCount ?? 0}</span>
          <span className="stat-sub nkfs-p-p text-muted">{isSifu ? 'Aguardando Sifu' : 'Em análise'}</span>
        </Link>

        {isSifu ? (
          <Link
            href="/admin/avisos"
            prefetch={true}
            className="stat-box hover:border-[var(--color-primary)] transition-all group cursor-pointer"
          >
            <span className="stat-label nkfs-tag-p text-muted group-hover:text-primary transition-colors">
              Avisos Ativos
            </span>
            <span className="stat-value nkfs-h-g text-main mt-0.5">{totalAnnouncements ?? 0}</span>
            <span className="stat-sub nkfs-p-p text-muted">Mural oficial</span>
          </Link>
        ) : (
          <Link
            href="/admin/horarios"
            prefetch={true}
            className="stat-box hover:border-[var(--color-primary)] transition-all group cursor-pointer"
          >
            <span className="stat-label nkfs-tag-p text-muted group-hover:text-primary transition-colors">
              Aulas Semanais
            </span>
            <span className="stat-value nkfs-h-g text-main mt-0.5">{totalClasses ?? 0}</span>
            <span className="stat-sub nkfs-p-p text-muted">Grade oficial</span>
          </Link>
        )}
      </section>

      {/* ── ATALHOS RÁPIDOS (DESIGN COMPACTO & DIRETO) ── */}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Acesso Rápido
        </h2>
        <div className={`grid grid-cols-2 ${isSifu ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-2.5 sm:gap-3`}>
          {/* Card: Gestão de Alunos */}
          <Link
            href="/admin/alunos"
            prefetch={true}
            className="card p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 hover:border-[var(--color-gold)] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
                👥
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-main group-hover:text-gold transition-colors truncate">
                  {isSifu ? 'Alunos' : 'Fichas & Alunos'}
                </h3>
                <p className="text-[11px] text-muted truncate">
                  {isSifu ? 'Fichas e cadastros' : 'Frequência e notas'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gold font-semibold pt-1 border-t border-[var(--color-border)]/50">
              <span>Gerenciar</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card: Listas de Exame */}
          <Link
            href="/admin/exames"
            prefetch={true}
            className="card p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 hover:border-[var(--color-gold)] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
                🥋
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-main group-hover:text-gold transition-colors truncate">
                  {isSifu ? 'Exames de Faixa' : 'Lista de Exame'}
                </h3>
                <p className="text-[11px] text-muted truncate">
                  {isSifu ? 'Homologação e banca' : 'Indicar para banca'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gold font-semibold pt-1 border-t border-[var(--color-border)]/50">
              <span>{isSifu ? 'Homologar' : 'Submeter'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card: Grade de Horários */}
          <Link
            href="/admin/horarios"
            prefetch={true}
            className="card p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 hover:border-[var(--color-gold)] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
                📅
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-main group-hover:text-gold transition-colors truncate">
                  Horários
                </h3>
                <p className="text-[11px] text-muted truncate">
                  {isSifu ? 'Grade de turmas' : 'Verificar treinos'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gold font-semibold pt-1 border-t border-[var(--color-border)]/50">
              <span>{isSifu ? 'Editar' : 'Visualizar'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card: Mural de Avisos (Apenas Sifu) */}
          {isSifu && (
            <Link
              href="/admin/avisos"
              prefetch={true}
              className="card p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 hover:border-[var(--color-primary)] transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  📢
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-main group-hover:text-primary transition-colors truncate">
                    Mural de Avisos
                  </h3>
                  <p className="text-[11px] text-muted truncate">
                    Comunicados da escola
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-primary font-semibold pt-1 border-t border-[var(--color-border)]/50">
                <span>Publicar</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ── FILA DE HOMOLOGAÇÃO DE ALUNOS (EXCLUSIVO SIFU) ── */}
      {isSifu && (
        <section id="homologacao-alunos" className="flex flex-col gap-3 scroll-mt-6">
          <div className="section-header">
            <div>
              <h2 className="nkfs-h-p text-main font-bold">
                Homologação de Alunos
              </h2>
              <p className="nkfs-p-m text-muted mt-0.5">
                {pending.length === 0
                  ? 'Nenhum cadastro pendente no momento'
                  : `${pending.length} solicitação${pending.length !== 1 ? 'ões' : ''} aguardando análise técnica`}
              </p>
            </div>
          </div>
          <ApprovalQueue initialPending={pending} graduations={graduations} />
        </section>
      )}

    </main>
  )
}