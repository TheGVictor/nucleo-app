import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestUserProfile } from '@/lib/user-cache'
import { AdminVideosManager, type AdminVideoRecord, type GraduationItem } from '@/components/admin/AdminVideosManager'

export default async function AdminVideosPage() {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await getRequestUserProfile(user.id)
  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  const adminClient = createAdminClient()

  // 1. Busca a modalidade Choy Lay Fut (CLF)
  const { data: clfMod } = await adminClient
    .from('modalities')
    .select('id, name, slug')
    .or('slug.eq.clf,name.ilike.%shaolin%,name.ilike.%choy%')
    .limit(1)
    .single()

  const clfModalityId = clfMod?.id || '36f1b22b-5c84-4ac7-a35b-5b1ff904d33a'

  // 2. Busca as graduações do CLF ordenadas por level_order
  const { data: graduationsData } = await adminClient
    .from('graduations')
    .select('id, level_name, level_order, color_hex, modality_id')
    .eq('modality_id', clfModalityId)
    .order('level_order', { ascending: true })

  const graduations: GraduationItem[] = graduationsData || []

  // 3. Busca todos os vídeos cadastrados com a graduação vinculada
  const { data: videosData } = await adminClient
    .from('videos')
    .select(`
      *,
      graduation:graduations(id, level_name, level_order, color_hex)
    `)
    .eq('modality_id', clfModalityId)
    .order('created_at', { ascending: false })

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
