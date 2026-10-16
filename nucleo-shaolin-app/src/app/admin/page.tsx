import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TopBar } from '@/components/layout/TopBar'
import { ApprovalQueue } from '@/components/admin/ApprovalQueue'
import { AnnouncementsManager } from '@/components/admin/AnnouncementsManager'
import { Badge } from '@/components/ui/Badge'
import { Logo } from '@/components/ui/Logo'
import type { AnnouncementWithModality } from './announcements/actions'

export const instant = false

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

interface TodayClassItem {
  id: string
  title: string
  start_time: string
  end_time: string
  modality: { name: string } | null
}

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

  // 1. Cadastros pendentes
  const { data: rawPending } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      birth_date,
      created_at,
      student_modalities(
        id,
        self_reported_level,
        status,
        modality:modalities(id, name, slug)
      )
    `)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true })

  const pending = (rawPending ?? []).map(p => ({
    ...p,
    student_modalities: ((p.student_modalities as unknown as RawStudentModality[]) ?? []).map((sm) => ({
      ...sm,
      modality: Array.isArray(sm.modality) ? sm.modality[0] ?? null : sm.modality,
    })),
  }))

  // 2. Métricas
  const { count: activeStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')
    .eq('status', 'active')

  // 3. Aulas de hoje
  const todayIndex = new Date().getDay()
  const { data: todayClasses } = await supabase
    .from('class_schedules')
    .select('*, modality:modalities(name)')
    .eq('day_of_week', todayIndex)
    .eq('active', true)
    .order('start_time', { ascending: true })

  // 4. Avisos da Escola para o CRUD
  const { data: rawAnnouncements } = await adminClient
    .from('announcements')
    .select(`
      *,
      modality:modalities(id, name, slug)
    `)
    .order('created_at', { ascending: false })

  const announcements = (rawAnnouncements as AnnouncementWithModality[]) ?? []

  // 5. Lista de Modalidades
  const { data: modalitiesList } = await adminClient
    .from('modalities')
    .select('id, name, slug')
    .order('name', { ascending: true })

  const modalities = modalitiesList ?? []

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main pb-12">
      <TopBar profile={profile} title="Painel do Sifu" />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 animate-fade-in">
        
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
                Gestão técnica, operacional e pedagógica do Núcleo de Kung Fu Shaolin
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href="#gestao-avisos" className="btn btn-outline btn-sm">
              📢 Gerenciar Avisos
            </a>
            <a href="#homologacao-alunos" className="btn btn-gold btn-sm">
              🥋 Alunos Pendentes
            </a>
          </div>
        </div>

        {/* Métricas Principais com Stat-Box do DS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="stat-box">
            <span className="stat-label nkfs-tag-p text-muted">Alunos Ativos</span>
            <span className="stat-value nkfs-h-g text-main mt-1">{activeStudents ?? 0}</span>
            <span className="stat-sub nkfs-p-p text-muted">Matrículas ativas</span>
          </div>
          <div className="stat-box">
            <span className="stat-label nkfs-tag-p text-gold">Pendentes</span>
            <span className="stat-value nkfs-h-g text-gold mt-1">{pending.length}</span>
            <span className="stat-sub nkfs-p-p text-muted">Aguardando análise</span>
          </div>
          <div className="stat-box">
            <span className="stat-label nkfs-tag-p text-primary">Aulas Hoje</span>
            <span className="stat-value nkfs-h-g text-primary mt-1">{todayClasses?.length ?? 0}</span>
            <span className="stat-sub nkfs-p-p text-muted">Horários previstos</span>
          </div>
          <div className="stat-box">
            <span className="stat-label nkfs-tag-p text-success">Avisos Ativos</span>
            <span className="stat-value nkfs-h-g text-success mt-1">{announcements.length}</span>
            <span className="stat-sub nkfs-p-p text-muted">Comunicados no mural</span>
          </div>
        </section>

        {/* Turmas Programadas do Dia */}
        <section className="card p-5 flex flex-col gap-3">
          <div className="section-header mb-1">
            <h2 className="section-title nkfs-tag-m text-gold">
              Turmas Programadas para Hoje
            </h2>
            <span className="nkfs-tag-p text-muted">Grade do Dia</span>
          </div>

          {todayClasses && todayClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(todayClasses as unknown as TodayClassItem[]).map((c) => (
                <div key={c.id} className="card-elevated p-3.5 flex justify-between items-center">
                  <div>
                    <span className="nkfs-tag-p text-primary block">{c.modality?.name}</span>
                    <span className="nkfs-p-m font-semibold text-main">{c.title}</span>
                  </div>
                  <Badge variant="muted">
                    {c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-6">
              <span className="empty-state-icon">📅</span>
              <p className="empty-state-title">Nenhuma aula agendada para hoje</p>
            </div>
          )}
        </section>

        {/* Gestão de Avisos e Comunicados (CRUD Completo) */}
        <section id="gestao-avisos" className="scroll-mt-6">
          <AnnouncementsManager
            initialAnnouncements={announcements}
            modalities={modalities}
          />
        </section>

        {/* Fila de Aprovações de Cadastros */}
        <section id="homologacao-alunos" className="flex flex-col gap-3 scroll-mt-6">
          <div>
            <h2 className="nkfs-h-p text-main font-bold">
              Fila de Homologação de Alunos
            </h2>
            <p className="nkfs-p-m text-muted mt-0.5">
              {pending.length} solicitação{pending.length !== 1 ? 'ões' : ''} aguardando análise técnica
            </p>
          </div>
          <ApprovalQueue initialPending={pending} />
        </section>

      </main>
    </div>
  )
}