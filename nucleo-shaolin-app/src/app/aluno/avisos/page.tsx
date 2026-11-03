import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bell, ArrowLeft } from 'lucide-react'
import { AnnouncementsList } from '@/components/aluno/AnnouncementsList'
import { Badge } from '@/components/ui/Badge'
import { filterStudentAnnouncements } from '@/lib/announcements'
import {
  getRequestAuthUser,
  getRequestUserProfile,
  getRequestStudentModalities,
} from '@/lib/user-cache'
import { getCachedAnnouncements } from '@/lib/cached-queries'

export const instant = false

export default async function AlunoAvisosPage() {
  const user = await getRequestAuthUser()
  if (!user) redirect('/login')

  const [profile, modalities, allAnnouncements] = await Promise.all([
    getRequestUserProfile(user.id),
    getRequestStudentModalities(user.id),
    getCachedAnnouncements(),
  ])

  if (!profile) redirect('/login')
  if (profile.status === 'pending_approval') redirect('/aguardando')
  if (profile.status !== 'active') redirect('/login')

  const modalityIds = modalities
    .map((m) => m.modality?.id)
    .filter((id): id is string => Boolean(id))

  const announcements = filterStudentAnnouncements(
    allAnnouncements,
    user.id,
    profile.full_name,
    modalityIds
  )

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      {/* Cabeçalho do Mural de Avisos / Notificações */}
      <div className="section-header pb-3 border-b border-[var(--color-border)] flex items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="nkfs-h-m text-main font-bold">Mural de Avisos</h1>
            <Badge variant="gold">{announcements.length}</Badge>
          </div>
          <p className="nkfs-p-m text-muted mt-1">
            Notificações, cartazes, datas de exame e comunicados oficiais da Núcleo Shaolin.
          </p>
        </div>

        <Link
          href="/aluno"
          className="btn btn-outline btn-sm shrink-0 text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Início</span>
        </Link>
      </div>

      <div className="card p-4 sm:p-5">
        <AnnouncementsList items={announcements} />
      </div>
    </main>
  )
}

