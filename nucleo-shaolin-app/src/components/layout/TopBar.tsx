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
  beltColor?: string
  beltName?: string
}

export function TopBar({ profile, title: explicitTitle, beltColor, beltName }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const title = explicitTitle ?? (
    pathname === '/aluno/aulas'
      ? 'Grade de Aulas'
      : pathname === '/aluno/ficha'
      ? 'Ficha Técnica'
      : pathname === '/aluno/videos'
      ? 'Treino em Vídeo'
      : pathname === '/aluno/perfil'
      ? 'Meu Perfil'
      : pathname === '/admin/alunos'
      ? 'Gestão de Alunos'
      : pathname === '/admin/horarios'
      ? 'Grade de Horários'
      : pathname === '/admin/avisos'
      ? 'Mural de Avisos'
      : pathname.startsWith('/admin')
      ? 'Painel do Instrutor'
      : profile.full_name.split(' ')[0]
  )

  return (
    <header
      className="top-bar transition-all"
      style={
        beltColor
          ? {
              borderTop: `3px solid ${beltColor}`,
              boxShadow: `0 4px 20px ${beltColor}15`,
            }
          : undefined
      }
    >
      <div className="w-full max-w-[1216px] mx-auto flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Logo e Título com Indicador de Faixa */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Logo size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="nkfs-p-m font-bold text-main leading-tight truncate">
                {title ?? profile.full_name.split(' ')[0]}
              </p>
              {beltColor && (
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: beltColor }}
                  title={beltName ? `Graduação: ${beltName}` : undefined}
                />
              )}
            </div>
            <p className="nkfs-tag-p text-faint truncate">
              {profile.role === 'super_admin'
                ? 'Sifu — Super Admin'
                : profile.role === 'admin'
                ? 'Instrutor'
                : beltName ? `Faixa ${beltName.replace('Faixa ', '')}` : 'Aluno'}
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <Avatar name={profile.full_name} size="sm" gold />
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm px-2.5 py-1 text-xs text-muted hover:text-main"
            title="Sair da conta"
          >
            <span className="hidden sm:inline">Sair</span>
            <span className="sm:hidden text-xs">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}