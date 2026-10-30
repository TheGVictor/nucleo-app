import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  getRequestAuthUser,
  getRequestUserProfile,
  getRequestStudentModalities,
} from '@/lib/user-cache'
import { isOnlySandaStudent } from '@/lib/modality-utils'

export const instant = false

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getRequestAuthUser()
  if (!user) redirect('/login')

  const [profile, modalities] = await Promise.all([
    getRequestUserProfile(user.id),
    getRequestStudentModalities(user.id),
  ])

  if (!profile) redirect('/login')

  // O Sifu é exclusivamente o mestre da escola e não utiliza o painel de aluno
  if (profile.role === 'super_admin') {
    redirect('/admin')
  }

  interface RawGrad {
    color_hex?: string
    level_name?: string
  }

  const modData = modalities.find(m => m.status === 'active') || modalities[0]
  const approvedGrad = modData?.approved_graduation as unknown as RawGrad | RawGrad[] | null
  const grad = Array.isArray(approvedGrad) ? approvedGrad[0] : approvedGrad
  const beltColor = grad?.color_hex || undefined
  const beltName = grad?.level_name || modData?.self_reported_level || undefined

  const onlySanda = isOnlySandaStudent(modalities)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between">
      <TopBar profile={profile} beltColor={beltColor} beltName={beltName} />
      <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>
      <BottomNav hideFichaAndVideos={onlySanda} />
    </div>
  )
}
