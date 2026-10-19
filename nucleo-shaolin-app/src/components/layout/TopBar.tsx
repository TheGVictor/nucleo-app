'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { Profile } from '@/types/database'

interface TopBarProps {
  profile: Profile
  title?: string
}

export function TopBar({ profile, title: explicitTitle }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const title = explicitTitle ?? (
    pathname === '/aluno/ficha'
      ? 'Ficha Técnica'
      : pathname === '/aluno/videos'
      ? 'Treino em Vídeo'
      : pathname === '/aluno/perfil'
      ? 'Meu Perfil'
      : profile.full_name.split(' ')[0]
  )

  return (
    <header className="top-bar">
      <div className="flex items-center gap-3">
        <Logo size="sm" />
        <div>
          <p className="nkfs-p-m font-semibold text-[var(--color-text)] leading-tight">
            {title ?? profile.full_name.split(' ')[0]}
          </p>
          <p className="nkfs-tag-p text-faint">
            {profile.role === 'super_admin'
              ? 'Sifu — Super Admin'
              : profile.role === 'admin'
              ? 'Instrutor'
              : 'Aluno'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar name={profile.full_name} size="sm" gold />
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm nkfs-tag-p text-muted hover:text-[var(--color-text)]"
        >
          Sair
        </button>
      </div>
    </header>
  )
}