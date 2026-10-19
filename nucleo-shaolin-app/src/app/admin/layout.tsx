import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { AdminBottomNav } from '@/components/layout/AdminBottomNav'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (!['admin', 'super_admin'].includes(profile.role)) redirect('/aluno')

  // Busca contagem de cadastros pendentes para exibir no badge da navegação
  const { count: pendingCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_approval')

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between">
      <TopBar profile={profile} />
      <div className="flex-1 pb-24">
        {children}
      </div>
      <AdminBottomNav pendingCount={pendingCount ?? 0} />
    </div>
  )
}
