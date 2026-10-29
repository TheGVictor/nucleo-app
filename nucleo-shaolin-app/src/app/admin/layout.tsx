import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { TopBar } from '@/components/layout/TopBar'
import { AdminBottomNav } from '@/components/layout/AdminBottomNav'
import { getRequestAuthUser, getRequestUserProfile } from '@/lib/user-cache'

export const instant = false

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getRequestAuthUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()

  const [profile, { count: pendingCount }] = await Promise.all([
    getRequestUserProfile(user.id),
    adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval'),
  ])

  if (!profile) redirect('/login')
  if (!['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between">
      <TopBar profile={profile} />
      <div className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>
      <AdminBottomNav
        pendingCount={pendingCount ?? 0}
        role={profile.role}
      />
    </div>
  )
}
