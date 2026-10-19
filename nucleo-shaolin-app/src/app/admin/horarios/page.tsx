import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ScheduleManager } from '@/components/admin/ScheduleManager'
import { getClassSchedulesAction } from '@/app/admin/horarios/actions'

export const instant = false

interface RawModality {
  id: string
  name: string
  slug: string
}

export default async function AdminHorariosPage() {
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

  const [modalitiesRes, schedules] = await Promise.all([
    adminClient.from('modalities').select('id, name, slug').order('name'),
    getClassSchedulesAction(),
  ])

  const modalities = (modalitiesRes.data as RawModality[]) ?? []

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 animate-fade-in">
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="nkfs-h-m text-main font-bold">Grade Oficial de Aulas</h1>
          <p className="nkfs-p-m text-muted mt-0.5">
            Configure os horários semanais, turmas por faixa etária/graduação e modalidades atendidas.
          </p>
        </div>
      </div>

      <ScheduleManager
        initialSchedules={schedules}
        modalities={modalities}
      />
    </main>
  )
}
