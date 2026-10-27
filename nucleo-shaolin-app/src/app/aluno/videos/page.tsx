import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestStudentModalities } from '@/lib/user-cache'
import { Badge } from '@/components/ui/Badge'
import { VideosExplorer, type VideoItem } from '@/components/aluno/VideosExplorer'

interface DbVideoWithGrad {
  id: string
  title: string
  category: string
  description: string | null
  video_url: string
  duration_seconds: number | null
  graduation?: {
    level_name: string
    level_order: number
  } | null
}

export default async function VideosPage() {
  await connection()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtém as modalidades do aluno para identificar sua graduação em Kung Fu Shaolin
  const studentModalities = await getRequestStudentModalities(user.id)
  const clfMod = studentModalities?.find(
    (sm) =>
      sm.modality?.slug === 'clf' ||
      sm.modality?.name?.toLowerCase().includes('shaolin') ||
      sm.modality?.name?.toLowerCase().includes('choy')
  ) || studentModalities?.[0]

  const studentBelt =
    clfMod?.approved_graduation?.level_name ||
    clfMod?.self_reported_level ||
    'Faixa Laranja'

  const clfModalityId =
    clfMod?.modality_id ||
    clfMod?.modality?.id ||
    '36f1b22b-5c84-4ac7-a35b-5b1ff904d33a'

  // Busca vídeos cadastrados no Supabase para a modalidade
  const adminClient = createAdminClient()
  const { data: dbVideos } = await adminClient
    .from('videos')
    .select(`
      id,
      title,
      category,
      description,
      video_url,
      duration_seconds,
      graduation:graduations(level_name, level_order)
    `)
    .eq('modality_id', clfModalityId)
    .order('created_at', { ascending: false })

  // Mapeia vídeos reais do banco para a interface do explorer
  const initialVideos: VideoItem[] =
    dbVideos && dbVideos.length > 0
      ? (dbVideos as unknown as DbVideoWithGrad[]).map((v) => ({
          id: v.id,
          title: v.title,
          category: v.category as VideoItem['category'],
          belt: v.graduation?.level_name || 'Faixa Branca',
          beltOrder: v.graduation?.level_order || 1,
          description: v.description,
          video_url: v.video_url,
          duration_seconds: v.duration_seconds,
        }))
      : []

  return (
    <main className="page-container py-5 flex flex-col gap-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="nkfs-h-m text-main font-bold">Biblioteca de Treino em Vídeo</h1>
            <Badge variant="gold">Oficial NKFS</Badge>
          </div>
          <p className="nkfs-p-p text-muted">
            Katis, formas clássicas, ataques e técnicas homologadas pelo Sifu para estudo pessoal.
          </p>
        </div>

        <span className="nkfs-tag-p text-gold self-start sm:self-auto font-bold">
          🥋 Estudo Técnico Shaolin
        </span>
      </div>

      <VideosExplorer
        studentCurrentBelt={studentBelt}
        initialVideos={initialVideos}
      />
    </main>
  )
}