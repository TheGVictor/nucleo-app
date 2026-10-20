import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApprovalQueue } from '@/components/admin/ApprovalQueue'
import { Logo } from '@/components/ui/Logo'
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

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      
      {/* Banner do Sifu / Instrutor */}
      <div className="card-gold p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-gold">
        <div className="flex items-center gap-4">
          <Logo size="lg" priority />
          <div>
            <span className="nkfs-tag-p text-gold block mb-1">
              {isSifu ? 'Mestre Responsável' : 'Instrutor Autorizado'}
            </span>
            <h1 className="nkfs-h-m text-main font-bold">
              {isSifu ? `Sifu ${profile.full_name.split(' ')[0]}` : `Instrutor ${profile.full_name.split(' ')[0]}`}
            </h1>
            <p className="nkfs-p-m text-muted mt-0.5">
              {isSifu
                ? 'Gestão pedagógica, técnica e operacional do Núcleo de Kung Fu Shaolin'
                : 'Acompanhamento pedagógico, anotação de fichas e indicação para banca de exames'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Link href="/admin/alunos" prefetch={true} className="btn btn-gold btn-sm">
            👥 {isSifu ? 'Buscar Alunos' : 'Fichas & Alunos'}
          </Link>
          <Link href="/admin/exames" prefetch={true} className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <span>🥋</span>
            <span>{isSifu ? 'Homologar Exames' : 'Listas de Exame'}</span>
            {(pendingExamsCount ?? 0) > 0 && isSifu && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 rounded-full">
                {pendingExamsCount}
              </span>
            )}
          </Link>
          {isSifu && (
            <>
              <Link href="/admin/horarios" prefetch={true} className="btn btn-outline btn-sm">
                📅 Horários
              </Link>
              <Link href="/admin/avisos" prefetch={true} className="btn btn-outline btn-sm">
                📢 Avisos
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Métricas Principais */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/admin/alunos"
          prefetch={true}
          className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
        >
          <span className="stat-label nkfs-tag-p text-muted group-hover:text-gold transition-colors">
            Alunos Ativos →
          </span>
          <span className="stat-value nkfs-h-g text-main mt-1">{activeStudents ?? 0}</span>
          <span className="stat-sub nkfs-p-p text-muted">Matrículas ativas</span>
        </Link>

        {isSifu ? (
          <a
            href="#homologacao-alunos"
            className="stat-box hover:border-[var(--color-gold)] transition-all group"
          >
            <span className="stat-label nkfs-tag-p text-gold">Cadastros</span>
            <span className="stat-value nkfs-h-g text-gold mt-1">{pending.length}</span>
            <span className="stat-sub nkfs-p-p text-muted">Aguardando análise</span>
          </a>
        ) : (
          <Link
            href="/admin/exames"
            prefetch={true}
            className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
          >
            <span className="stat-label nkfs-tag-p text-gold">Exames →</span>
            <span className="stat-value nkfs-h-g text-gold mt-1">Banca</span>
            <span className="stat-sub nkfs-p-p text-muted">Propostas ao Sifu</span>
          </Link>
        )}

        <Link
          href="/admin/exames"
          prefetch={true}
          className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
        >
          <span className="stat-label nkfs-tag-p text-primary group-hover:text-gold transition-colors">
            {isSifu ? 'Exames Pendentes →' : 'Listas de Exame →'}
          </span>
          <span className="stat-value nkfs-h-g text-primary mt-1">{pendingExamsCount ?? 0}</span>
          <span className="stat-sub nkfs-p-p text-muted">{isSifu ? 'Aguardando Sifu' : 'Em análise'}</span>
        </Link>

        {isSifu ? (
          <Link
            href="/admin/avisos"
            prefetch={true}
            className="stat-box hover:border-[var(--color-primary)] transition-all group cursor-pointer"
          >
            <span className="stat-label nkfs-tag-p text-muted group-hover:text-primary transition-colors">
              Avisos Ativos →
            </span>
            <span className="stat-value nkfs-h-g text-main mt-1">{totalAnnouncements ?? 0}</span>
            <span className="stat-sub nkfs-p-p text-muted">Mural oficial</span>
          </Link>
        ) : (
          <Link
            href="/admin/horarios"
            prefetch={true}
            className="stat-box hover:border-[var(--color-primary)] transition-all group cursor-pointer"
          >
            <span className="stat-label nkfs-tag-p text-muted group-hover:text-primary transition-colors">
              Aulas Semanais →
            </span>
            <span className="stat-value nkfs-h-g text-main mt-1">{totalClasses ?? 0}</span>
            <span className="stat-sub nkfs-p-p text-muted">Grade oficial</span>
          </Link>
        )}
      </section>

      {/* ── ATALHOS RÁPIDOS PRINCIPAIS ─────────────────────────── */}
      <section className={`grid grid-cols-1 ${isSifu ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        {/* Card Atalho: Gestão de Alunos */}
        <Link
          href="/admin/alunos"
          prefetch={true}
          className="card-elevated p-5 flex flex-col justify-between gap-3 hover:border-[var(--color-gold)] transition-all group cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-gold-muted)] border border-[var(--color-border-gold)] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              👥
            </div>
            <h2 className="nkfs-h-p text-main font-bold group-hover:text-gold transition-colors">
              {isSifu ? 'Buscar & Gerenciar Alunos' : 'Fichas & Alunos'}
            </h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {isSifu
              ? 'Acesse fichas técnicas, acompanhe desenvolvimento, consulte cadastros e promova instrutores.'
              : 'Consulte alunos, registre frequências e anote as fichas técnicas com repetições e notas pedagógicas.'}
          </p>
          <span className="text-xs text-gold font-bold group-hover:translate-x-1 transition-transform self-end">
            Acessar Alunos →
          </span>
        </Link>

        {/* Card Atalho: Listas de Exame */}
        <Link
          href="/admin/exames"
          prefetch={true}
          className="card-elevated p-5 flex flex-col justify-between gap-3 hover:border-[var(--color-gold)] transition-all group cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🥋
            </div>
            <h2 className="nkfs-h-p text-main font-bold group-hover:text-gold transition-colors">
              {isSifu ? 'Banca & Homologação de Exames' : 'Enviar Lista de Exame ao Sifu'}
            </h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {isSifu
              ? 'Avalie as propostas de exame enviadas pelos instrutores e homologue as aprovações de faixa.'
              : 'Selecione os alunos aptos da sua turma, escolha a próxima faixa e submeta a lista oficial ao Sifu.'}
          </p>
          <span className="text-xs text-gold font-bold group-hover:translate-x-1 transition-transform self-end">
            Ver Listas de Exame →
          </span>
        </Link>

        {/* Card Atalho: Grade de Horários */}
        <Link
          href="/admin/horarios"
          prefetch={true}
          className="card-elevated p-5 flex flex-col justify-between gap-3 hover:border-[var(--color-gold)] transition-all group cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              📅
            </div>
            <h2 className="nkfs-h-p text-main font-bold group-hover:text-gold transition-colors">
              {isSifu ? 'Grade de Horários' : 'Verificar Aulas'}
            </h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {isSifu
              ? 'Consulte e edite os horários oficiais da semana de segunda a sábado por turma e modalidade.'
              : 'Consulte os dias e horários de treino semanais por turma, faixa etária e modalidades atendidas.'}
          </p>
          <span className="text-xs text-gold font-bold group-hover:translate-x-1 transition-transform self-end">
            {isSifu ? 'Gerenciar Horários →' : 'Ver Horários →'}
          </span>
        </Link>

        {/* Card Atalho: Mural de Avisos (Apenas Sifu) */}
        {isSifu && (
          <Link
            href="/admin/avisos"
            prefetch={true}
            className="card-elevated p-5 flex flex-col justify-between gap-3 hover:border-[var(--color-primary)] transition-all group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-muted)] border border-[var(--color-primary)] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                📢
              </div>
              <h2 className="nkfs-h-p text-main font-bold group-hover:text-primary transition-colors">
                Mural de Avisos
              </h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Crie comunicados com imagem, publique avisos gerais, por modalidade ou para grupos de alunos.
            </p>
            <span className="text-xs text-primary font-bold group-hover:translate-x-1 transition-transform self-end">
              Gerenciar Avisos →
            </span>
          </Link>
        )}
      </section>

      {/* Fila de Aprovações de Cadastros (Exclusivo Sifu) */}
      {isSifu && (
        <section id="homologacao-alunos" className="flex flex-col gap-3 scroll-mt-6">
          <div className="section-header">
            <div>
              <h2 className="nkfs-h-p text-main font-bold">
                Fila de Homologação de Alunos
              </h2>
              <p className="nkfs-p-m text-muted mt-0.5">
                {pending.length} solicitação{pending.length !== 1 ? 'ões' : ''} aguardando análise técnica
              </p>
            </div>
          </div>
          <ApprovalQueue initialPending={pending} graduations={graduations} />
        </section>
      )}

    </main>
  )
}