'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ShoppingBag, Shield, Award, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
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
  const lojaHref = isAdminRoute ? '/admin/loja' : '/aluno/loja'
  const avisosHref = isAdminRoute ? '/admin/avisos' : '/aluno/avisos'

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

        {/* Lado Direito: Somente Ícone da Loja + Ícone de Perfil com Dropdown */}
        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          {/* 1. Ícone da Loja */}
          <Link
            href={lojaHref}
            prefetch={true}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 border ${
              isLojaPage
                ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] shadow-xs'
                : 'bg-[var(--color-bg-card)] text-main hover:text-gold border-[var(--color-border)] hover:border-[var(--color-border-gold)]'
            }`}
            title="Loja Oficial"
            aria-label="Loja Oficial"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
          </Link>

          {/* 2. Ícone de Perfil (Abre Dropdown) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 border cursor-pointer ${
                menuOpen || pathname === '/aluno/perfil'
                  ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] shadow-xs'
                  : 'bg-[var(--color-bg-card)] text-main hover:text-gold border-[var(--color-border)] hover:border-[var(--color-border-gold)]'
              }`}
              title="Menu do Perfil"
              aria-label="Abrir menu do perfil"
              aria-expanded={menuOpen}
            >
              <User className="w-4 h-4 shrink-0" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl py-2 z-50 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                  <p className="text-xs font-extrabold text-main truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    {profile.role === 'super_admin'
                      ? 'Super Admin'
                      : profile.role === 'admin' || profile.role === 'instructor'
                      ? 'Instrutor'
                      : 'Aluno Matriculado'}
                  </p>
                </div>

                <div className="py-1 flex flex-col">
                  <Link
                    href="/aluno/perfil"
                    prefetch={true}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-main hover:text-gold hover:bg-[var(--color-bg-elevated)] flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-gold shrink-0" />
                    <span>Ver Perfil</span>
                  </Link>

                  <Link
                    href={avisosHref}
                    prefetch={true}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-main hover:text-gold hover:bg-[var(--color-bg-elevated)] flex items-center gap-2.5 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-gold shrink-0" />
                    <span>Notificações</span>
                  </Link>

                  {(profile.role === 'instructor' || profile.role === 'admin') && (
                    <Link
                      href={isAdminRoute ? '/aluno' : '/admin'}
                      prefetch={true}
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2.5 text-xs font-semibold text-main hover:text-gold hover:bg-[var(--color-bg-elevated)] flex items-center gap-2.5 transition-colors"
                    >
                      {isAdminRoute ? (
                        <>
                          <Award className="w-4 h-4 text-gold shrink-0" />
                          <span>Área do Aluno</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 text-gold shrink-0" />
                          <span>Painel do Instrutor</span>
                        </>
                      )}
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
