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

  const [profileRes, modalityRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('student_modalities')
      .select(`
        self_reported_level,
        approved_graduation:graduations(color_hex, level_name)
      `)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
  ])

  const profile = profileRes.data
  if (!profile) redirect('/login')

  // O Sifu é exclusivamente o mestre da escola e não utiliza o painel de aluno
  if (profile.role === 'super_admin') {
    redirect('/admin')
  }

  interface RawGrad {
    color_hex?: string
    level_name?: string
  }

  const modData = modalityRes.data
  const approvedGrad = modData?.approved_graduation as unknown as RawGrad | RawGrad[] | null
  const grad = Array.isArray(approvedGrad) ? approvedGrad[0] : approvedGrad
  const beltColor = grad?.color_hex || undefined
  const beltName = grad?.level_name || modData?.self_reported_level || undefined

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between">
      <TopBar profile={profile} beltColor={beltColor} beltName={beltName} />
      <div className="flex-1 pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
