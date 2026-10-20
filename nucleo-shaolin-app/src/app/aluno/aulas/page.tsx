import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentScheduleView } from '@/components/aluno/StudentScheduleView'
import { getRequestUserProfile } from '@/lib/user-cache'
import { getCachedClassSchedules } from '@/lib/cached-queries'
import type { ClassSchedule } from '@/types/database'

export const instant = false

interface ScheduleWithModality extends ClassSchedule {
  modality?: {
    id: string
    name: string
    slug: string
  } | null
}

export default async function AlunoAulasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, schedulesData] = await Promise.all([
    getRequestUserProfile(user.id),
    getCachedClassSchedules(),
  ])

  if (!profile || profile.status !== 'active') {
    redirect('/login')
  }

  const schedules = (schedulesData as ScheduleWithModality[]) ?? []

  return (
    <main className="page-container py-5 flex flex-col gap-5 animate-fade-in">
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="nkfs-h-m text-main font-bold">Grade de Aulas & Horários</h1>
          <p className="nkfs-p-m text-muted mt-0.5">
            Confira todos os horários e turmas de Kung Fu Shaolin, Tai Chi Chuan e Sanda.
          </p>
        </div>
      </div>

      <StudentScheduleView schedules={schedules} />
    </main>
  )
}
