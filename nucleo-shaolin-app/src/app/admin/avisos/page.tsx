import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AnnouncementsManager } from '@/components/admin/AnnouncementsManager'
import type { AnnouncementWithModality } from '@/app/admin/announcements/actions'

export const instant = false

interface RawModality {
  id: string
  name: string
  slug: string
}

export default async function AdminAvisosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  const adminClient = createAdminClient()

  const [modalitiesRes, announcementsRes, studentsRes] = await Promise.all([
    adminClient.from('modalities').select('id, name, slug').order('name'),
    adminClient
      .from('announcements')
      .select('*, modality:modalities(id, name, slug)')
      .order('created_at', { ascending: false }),
    adminClient
      .from('profiles')
      .select(`
        id,
        full_name,
        student_modalities(
          status,
          modality:modalities(name),
          approved_graduation:graduations(level_name)
        )
      `)
      .eq('role', 'aluno')
      .order('full_name', { ascending: true }),
  ])

  const modalities = (modalitiesRes.data as RawModality[]) ?? []
  const announcements = (announcementsRes.data as AnnouncementWithModality[]) ?? []

  interface RawStudentProfile {
    id: string
    full_name: string | null
    student_modalities?: Array<{
      status?: string
      modality?: { name: string } | null
      approved_graduation?: { level_name: string } | null
    }>
  }

  const rawStudents = (studentsRes.data as unknown as RawStudentProfile[]) ?? []
  const students = rawStudents.map((s) => {
    const activeMod =
      s.student_modalities?.find((m) => m.status === 'active') ||
      s.student_modalities?.[0]
    return {
      id: s.id,
      full_name: s.full_name || 'Sem nome',
      modality_name: activeMod?.modality?.name,
      graduation_name: activeMod?.approved_graduation?.level_name,
    }
  })

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 animate-fade-in">
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="nkfs-h-m text-main font-bold">Mural de Avisos & Comunicados</h1>
          <p className="nkfs-p-m text-muted mt-0.5">
            Publique recados gerais para a escola, avisos por modalidade ou para um grupo de alunos.
          </p>
        </div>
      </div>

      <AnnouncementsManager
        modalities={modalities}
        initialAnnouncements={announcements}
        students={students}
      />
    </main>
  )
}
