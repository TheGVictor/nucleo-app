import { redirect } from 'next/navigation'
import {
  getRequestAuthUser,
  getRequestStudentModalities,
} from '@/lib/user-cache'
import { getCachedVideos } from '@/lib/cached-queries'
import { VideosExplorer, type VideoItem } from '@/components/aluno/VideosExplorer'

export const instant = false

interface DbVideoWithGrad {
  id: string
  title: string
  category: string
  description: string | null
  video_url: string
  duration_seconds: number | null
  modality_id?: string | null
  graduation?: {
    level_name: string
    level_order: number
  } | null
}

export default async function VideosPage() {
  const user = await getRequestAuthUser()
  if (!user) redirect('/login')

  const [studentModalities, allVideos] = await Promise.all([
    getRequestStudentModalities(user.id),
    getCachedVideos(),
  ])

  const clfMod =
    studentModalities?.find(
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

  const dbVideos = (allVideos as unknown as DbVideoWithGrad[]).filter(
    (v) => !v.modality_id || v.modality_id === clfModalityId
  )

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
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div>
          <h1 className="nkfs-h-m text-main font-bold">Vídeos de Treino</h1>
          <p className="text-xs text-muted mt-0.5">
            Conteúdo para {studentBelt}
          </p>
        </div>
      </div>

      <VideosExplorer
        studentCurrentBelt={studentBelt}
        initialVideos={initialVideos}
      />
    </main>
  )
}