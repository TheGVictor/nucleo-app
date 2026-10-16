import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Badge } from '@/components/ui/Badge'
import { VideosExplorer, type VideoItem } from '@/components/aluno/VideosExplorer'

export const instant = false

export default async function VideosPage() {
  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Vídeos liberados para o aluno
  const { data: videos } = await supabase
    .from('videos')
    .select('*, modality:modalities(name)')
    .order('created_at', { ascending: false })

  const videoList = (videos as unknown as VideoItem[]) ?? []

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main pb-24">
      <TopBar profile={profile} title="Treino em Vídeo" />

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

      <BottomNav />
    </div>
  )
}