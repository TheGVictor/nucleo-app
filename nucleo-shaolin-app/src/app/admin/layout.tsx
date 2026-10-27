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

  // Busca contagem de cadastros pendentes
  const { count: pendingCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_approval')

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
