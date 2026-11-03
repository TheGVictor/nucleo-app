'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ShoppingBag, Shield, Award, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { Profile } from '@/types/database'

interface TopBarProps {
  profile: Profile
  title?: string
  beltColor?: string
  beltName?: string
}

export function TopBar({ profile, title: explicitTitle, beltColor }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isAdminRoute = pathname.startsWith('/admin')

  const title = explicitTitle ?? (
    pathname === '/aluno/aulas'
      ? 'Grade de Aulas'
      : pathname === '/aluno/ficha'
      ? 'Ficha Técnica'
      : pathname === '/aluno/videos'
      ? 'Treino em Vídeo'
      : pathname === '/aluno/perfil'
      ? 'Meu Perfil'
      : pathname === '/aluno/loja'
      ? 'Loja Oficial'
      : pathname === '/aluno/avisos'
      ? 'Mural de Avisos'
      : pathname === '/admin/loja'
      ? 'Gestão da Loja'
      : pathname === '/admin/alunos'
      ? 'Gestão de Alunos'
      : pathname === '/admin/horarios'
      ? (profile.role === 'super_admin' ? 'Grade de Horários' : 'Aulas & Horários')
      : pathname === '/admin/avisos'
      ? 'Mural de Avisos'
      : pathname === '/admin/exames'
      ? 'Listas de Exame'
      : isAdminRoute
      ? (profile.role === 'super_admin' ? 'Painel da Escola' : 'Painel do Instrutor')
      : 'Núcleo Shaolin'
  )

  const isLojaPage = pathname.includes('/loja')
  const isAvisosPage = pathname.includes('/avisos')

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
      <div className="w-full max-w-[1216px] mx-auto min-h-[50px] py-1 flex items-center justify-between gap-3 flex-nowrap min-w-0">
        {/* Lado Esquerdo: Logo e Título Limpo */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <Link
            href={isAdminRoute ? '/admin' : '/aluno'}
            title="Início"
            className="shrink-0 hover:scale-105 transition-transform"
          >
            <Logo size="sm" />
          </Link>
          <p className="text-sm sm:text-base font-bold text-main leading-tight truncate">
            {title}
          </p>
        </div>

        {/* Lado Direito: Ações Essenciais (Sem Poluição Visual) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
          {/* Alternar visão Aluno <-> Instrutor apenas para instrutores */}
          {(profile.role === 'instructor' || profile.role === 'admin') && (
            isAdminRoute ? (
              <Link
                href="/aluno"
                prefetch={true}
                className="btn btn-secondary btn-sm p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold flex items-center gap-1 shrink-0"
                title="Acessar minha área de aluno"
              >
                <Award className="w-3.5 h-3.5 text-gold" />
                <span className="hidden sm:inline">Aluno</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                prefetch={true}
                className="btn btn-gold btn-sm p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold flex items-center gap-1 shrink-0"
                title="Acessar painel do instrutor"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instrutor</span>
              </Link>
            )
          )}

          {/* Atalhos de Avisos e Loja apenas no painel Admin */}
          {isAdminRoute && (
            <>
              <Link
                href="/admin/avisos"
                prefetch={true}
                className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shrink-0 ${
                  isAvisosPage
                    ? 'bg-[var(--color-gold)] text-black font-bold shadow-xs'
                    : 'text-muted hover:text-main hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)]'
                }`}
                title="Mural de Avisos"
                aria-label="Mural de Avisos"
              >
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Avisos</span>
              </Link>

              <Link
                href="/admin/loja"
                prefetch={true}
                className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shrink-0 ${
                  isLojaPage
                    ? 'bg-[var(--color-gold)] text-black font-bold shadow-xs'
                    : 'text-muted hover:text-main hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border)]'
                }`}
                title="Gestão da Loja"
                aria-label="Gestão da Loja"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Loja</span>
              </Link>
            </>
          )}

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted hover:text-main hover:bg-[var(--color-bg-elevated)] transition-colors shrink-0 flex items-center justify-center"
            title="Sair da conta"
            aria-label="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}