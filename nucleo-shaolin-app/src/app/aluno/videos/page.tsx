import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRequestStudentModalities } from '@/lib/user-cache'
import { Badge } from '@/components/ui/Badge'
import { VideosExplorer } from '@/components/aluno/VideosExplorer'

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

      <VideosExplorer studentCurrentBelt={studentBelt} />
    </main>
  )
}