import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export const instant = false

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between">
      <TopBar profile={profile} />
      <div className="flex-1 pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
