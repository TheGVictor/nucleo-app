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
      ? (profile.role === 'super_admin' ? 'Grade de Horários' : 'Aulas & Horários')
      : pathname === '/admin/avisos'
      ? 'Mural de Avisos'
      : pathname === '/admin/exames'
      ? 'Listas de Exame'
      : pathname.startsWith('/admin')
      ? (profile.role === 'super_admin' ? 'Painel do Sifu' : 'Painel do Instrutor')
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
                : (profile.role === 'admin' || profile.role === 'instructor')
                ? 'Instrutor'
                : beltName ? `Faixa ${beltName.replace('Faixa ', '')}` : 'Aluno'}
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Alternar visão Aluno <-> Instrutor apenas para instrutores (que também são alunos) */}
          {(profile.role === 'instructor' || profile.role === 'admin') && (
            pathname.startsWith('/admin') ? (
              <button
                onClick={() => {
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = '/aluno'
                }}
                className="btn btn-secondary btn-sm px-2.5 py-1 text-xs font-semibold flex items-center gap-1"
                title="Acessar minha área de aluno"
              >
                <span>🥋</span>
                <span className="hidden sm:inline">Ver como Aluno</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = '/admin'
                }}
                className="btn btn-gold btn-sm px-2.5 py-1 text-xs font-semibold flex items-center gap-1"
                title="Acessar painel do instrutor"
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Painel Instrutor</span>
              </button>
            )
          )}

          <ThemeToggle />
          <Avatar name={profile.full_name} size="sm" gold />
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm px-2.5 py-1 text-xs text-muted hover:text-main"
            title="Sair da conta"
          >
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}