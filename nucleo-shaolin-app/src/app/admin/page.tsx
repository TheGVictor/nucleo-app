import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApprovalQueue } from '@/components/admin/ApprovalQueue'
import { Logo } from '@/components/ui/Logo'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (!['admin', 'super_admin'].includes(profile.role)) redirect('/aluno')

  const adminClient = createAdminClient()

  // 1. Cadastros pendentes de homologação
  const { data: rawPending } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
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
      birth_date: p.birth_date,
      created_at: p.created_at,
      student_modalities: mapped,
    }
  })

  // 2. Contadores gerais
  const [{ count: activeStudents }, { count: totalAnnouncements }, { count: totalClasses }] = await Promise.all([
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
  ])

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      
      {/* Banner do Sifu / Header Operacional */}
      <div className="card-gold p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-gold">
        <div className="flex items-center gap-4">
          <Logo size="lg" priority />
          <div>
            <span className="nkfs-tag-p text-gold block mb-1">
              {profile.role === 'super_admin' ? 'Mestre Responsável' : 'Instrutor Autorizado'}
            </span>
            <h1 className="nkfs-h-m text-main font-bold">
              Sifu {profile.full_name.split(' ')[0]}
            </h1>
            <p className="nkfs-p-m text-muted mt-0.5">
              Gestão pedagógica, técnica e operacional do Núcleo de Kung Fu Shaolin
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Link href="/admin/alunos" prefetch={true} className="btn btn-gold btn-sm">
            👥 Buscar Alunos
          </Link>
          <Link href="/admin/horarios" prefetch={true} className="btn btn-secondary btn-sm">
            📅 Horários
          </Link>
          <Link href="/admin/avisos" prefetch={true} className="btn btn-outline btn-sm">
            📢 Avisos
          </Link>
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

        <a
          href="#homologacao-alunos"
          className="stat-box hover:border-[var(--color-gold)] transition-all group"
        >
          <span className="stat-label nkfs-tag-p text-gold">Pendentes</span>
          <span className="stat-value nkfs-h-g text-gold mt-1">{pending.length}</span>
          <span className="stat-sub nkfs-p-p text-muted">Aguardando análise</span>
        </a>

        <Link
          href="/admin/horarios"
          prefetch={true}
          className="stat-box hover:border-[var(--color-gold)] transition-all group cursor-pointer"
        >
          <span className="stat-label nkfs-tag-p text-primary group-hover:text-gold transition-colors">
            Horários de Aula →
          </span>
          <span className="stat-value nkfs-h-g text-primary mt-1">{totalClasses ?? 0}</span>
          <span className="stat-sub nkfs-p-p text-muted">Turmas semanais</span>
        </Link>

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
      </section>

      {/* ── ATALHOS RÁPIDOS PRINCIPAIS ─────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Buscar & Gerenciar Alunos
            </h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Acesse a ficha técnica oficial, acompanhe o desenvolvimento técnico, consulte dados e envie comunicados.
          </p>
          <span className="text-xs text-gold font-bold group-hover:translate-x-1 transition-transform self-end">
            Acessar Alunos →
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
              Grade de Horários
            </h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Consulte e edite os horários oficiais da semana de segunda a sábado por turma e modalidade.
          </p>
          <span className="text-xs text-gold font-bold group-hover:translate-x-1 transition-transform self-end">
            Gerenciar Horários →
          </span>
        </Link>

        {/* Card Atalho: Mural de Avisos */}
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
      </section>

      {/* Fila de Aprovações de Cadastros */}
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
        <ApprovalQueue initialPending={pending} />
      </section>

    </main>
  )
}