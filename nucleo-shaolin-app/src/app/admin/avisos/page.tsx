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

  if (!profile || profile.role !== 'super_admin') {
    redirect('/admin')
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
        status,
        student_modalities(
          status,
          modality:modalities(name),
          approved_graduation:graduations(level_name)
        )
      `)
      .eq('role', 'student')
      .order('full_name', { ascending: true }),
  ])

  const modalities = (modalitiesRes.data as RawModality[]) ?? []
  const announcements = (announcementsRes.data as AnnouncementWithModality[]) ?? []

  interface RawStudentModality {
    status?: string
    modality?: { name?: string } | Array<{ name?: string }> | null
    approved_graduation?: { level_name?: string } | Array<{ level_name?: string }> | null
  }

  interface RawStudentProfile {
    id: string
    full_name: string | null
    status?: string
    student_modalities?: RawStudentModality | RawStudentModality[] | null
  }

  const rawStudents = (studentsRes.data as unknown as RawStudentProfile[]) ?? []
  const students = rawStudents
    .filter((s) => s.full_name && s.full_name.trim().length > 0)
    .map((s) => {
      const modalitiesList = Array.isArray(s.student_modalities)
        ? s.student_modalities
        : s.student_modalities
        ? [s.student_modalities]
        : []

      const activeMod =
        modalitiesList.find((m) => m.status === 'active') || modalitiesList[0]

      const rawMod = activeMod?.modality
      const modalityName = Array.isArray(rawMod)
        ? rawMod[0]?.name
        : rawMod?.name

      const rawGrad = activeMod?.approved_graduation
      const graduationName = Array.isArray(rawGrad)
        ? rawGrad[0]?.level_name
        : rawGrad?.level_name

      return {
        id: s.id,
        full_name: s.full_name?.trim() || 'Sem nome',
        modality_name: modalityName,
        graduation_name: graduationName,
      }
    })

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
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
