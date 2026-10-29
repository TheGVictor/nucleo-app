import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestAuthUser, getRequestUserProfile } from '@/lib/user-cache'
import { getCachedModalities } from '@/lib/cached-queries'
import { AdminVideosManager, type AdminVideoRecord, type GraduationItem } from '@/components/admin/AdminVideosManager'

export const instant = false

export default async function AdminVideosPage() {
  const user = await getRequestAuthUser()
  if (!user) redirect('/login')

  const [profile, modalities] = await Promise.all([
    getRequestUserProfile(user.id),
    getCachedModalities(),
  ])

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  const adminClient = createAdminClient()

  const clfMod = modalities.find(
    (m) =>
      m.slug === 'clf' ||
      m.name.toLowerCase().includes('shaolin') ||
      m.name.toLowerCase().includes('choy')
  )

  const clfModalityId = clfMod?.id || '36f1b22b-5c84-4ac7-a35b-5b1ff904d33a'

  const [{ data: graduationsData }, { data: videosData }] = await Promise.all([
    adminClient
      .from('graduations')
      .select('id, level_name, level_order, color_hex, modality_id')
      .eq('modality_id', clfModalityId)
      .order('level_order', { ascending: true }),
    adminClient
      .from('videos')
      .select(`
        *,
        graduation:graduations(id, level_name, level_order, color_hex)
      `)
      .eq('modality_id', clfModalityId)
      .order('created_at', { ascending: false }),
  ])

  const graduations: GraduationItem[] = graduationsData || []
  const initialVideos: AdminVideoRecord[] = videosData || []

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-6 animate-fade-in">
      <AdminVideosManager
        initialVideos={initialVideos}
        graduations={graduations}
        clfModalityId={clfModalityId}
      />
    </main>
  )
}
