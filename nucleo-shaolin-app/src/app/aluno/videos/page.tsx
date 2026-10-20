import { Badge } from '@/components/ui/Badge'
import { VideosExplorer, type VideoItem } from '@/components/aluno/VideosExplorer'
import { getCachedVideos } from '@/lib/cached-queries'

export default async function VideosPage() {
  const videos = await getCachedVideos()
  const videoList = (videos as unknown as VideoItem[]) ?? []

  return (
    <main className="page-container py-5 flex flex-col gap-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="nkfs-h-m text-main font-bold">Treino em Vídeo</h1>
            <Badge variant="gold">{videoList.length} {videoList.length === 1 ? 'vídeo' : 'vídeos'}</Badge>
          </div>
          <p className="nkfs-p-p text-muted">
            Katis, formas clássicas e sequências homologadas pelo Sifu para estudo pessoal.
          </p>
        </div>

        <span className="nkfs-tag-p text-gold self-start sm:self-auto font-bold">
          🥋 Estudo Técnico Shaolin
        </span>
      </div>

      <VideosExplorer initialVideos={videoList} />
    </main>
  )
}