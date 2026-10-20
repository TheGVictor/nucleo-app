import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { AdminBottomNav } from '@/components/layout/AdminBottomNav'
import { getRequestUserProfile } from '@/lib/user-cache'

export const instant = false

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getRequestUserProfile(user.id)

  if (!profile) redirect('/login')
  if (!['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  // Busca contagem de cadastros pendentes e contagem de listas de exame pendentes
  const [pendingRes, examsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval'),
    supabase
      .from('exam_lists')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const pendingCount = pendingRes.count ?? 0
  const pendingExamsCount = examsRes.count ?? 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between">
      <TopBar profile={profile} />
      <div className="flex-1 pb-24">
        {children}
      </div>
      <AdminBottomNav
        pendingCount={pendingCount}
        pendingExamsCount={pendingExamsCount}
        role={profile.role}
      />
    </div>
  )
}
