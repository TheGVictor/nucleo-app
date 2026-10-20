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
      <div className="w-full max-w-[1216px] mx-auto flex items-center justify-between gap-2 sm:gap-3 flex-nowrap min-w-0">
        {/* Lado Esquerdo: Logo e Título com Indicador de Faixa */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <Logo size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-sm sm:text-base font-bold text-main leading-tight truncate">
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
            <p className="text-[11px] sm:text-xs text-faint truncate leading-tight">
              {profile.role === 'super_admin'
                ? 'Sifu — Super Admin'
                : (profile.role === 'admin' || profile.role === 'instructor')
                ? 'Instrutor'
                : beltName ? `Faixa ${beltName.replace('Faixa ', '')}` : 'Aluno'}
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-nowrap">
          {/* Alternar visão Aluno <-> Instrutor apenas para instrutores (que também são alunos) */}
          {(profile.role === 'instructor' || profile.role === 'admin') && (
            pathname.startsWith('/admin') ? (
              <button
                onClick={() => {
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = '/aluno'
                }}
                className="btn btn-secondary btn-sm px-2 py-1 text-xs font-semibold flex items-center gap-1 shrink-0"
                title="Acessar minha área de aluno"
              >
                <span>🥋</span>
                <span className="hidden sm:inline">Aluno</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = '/admin'
                }}
                className="btn btn-gold btn-sm px-2 py-1 text-xs font-semibold flex items-center gap-1 shrink-0"
                title="Acessar painel do instrutor"
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Instrutor</span>
              </button>
            )
          )}

          <ThemeToggle />
          <Avatar name={profile.full_name} size="sm" gold />
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-[var(--color-bg-elevated)] transition-colors shrink-0 flex items-center justify-center"
            title="Sair da conta"
            aria-label="Sair da conta"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}