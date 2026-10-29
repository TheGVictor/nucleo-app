import { redirect } from 'next/navigation'
import { ScheduleManager } from '@/components/admin/ScheduleManager'
import { getClassSchedulesAction } from '@/app/admin/horarios/actions'
import { getRequestAuthUser, getRequestUserProfile } from '@/lib/user-cache'
import { getCachedModalities } from '@/lib/cached-queries'

export const instant = false


interface RawModality {
  id: string
  name: string
  slug: string
}

export default async function AdminHorariosPage() {
  const user = await getRequestAuthUser()
  if (!user) redirect('/login')

  const [profile, modalitiesData, schedules] = await Promise.all([
    getRequestUserProfile(user.id),
    getCachedModalities(),
    getClassSchedulesAction(),
  ])

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  const isReadOnly = profile.role !== 'super_admin'
  const modalities = (modalitiesData as RawModality[]) ?? []

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="nkfs-h-m text-main font-bold">
            {isReadOnly ? 'Grade de Aulas e Horários' : 'Grade Oficial de Aulas'}
          </h1>
          <p className="nkfs-p-m text-muted mt-0.5">
            {isReadOnly
              ? 'Verifique os horários semanais, turmas e modalidades da escola.'
              : 'Configure os horários semanais, turmas por faixa etária/graduação e modalidades atendidas.'}
          </p>
        </div>
      </div>

      <ScheduleManager
        initialSchedules={schedules}
        modalities={modalities}
        isReadOnly={isReadOnly}
      />
    </main>
  )
}
