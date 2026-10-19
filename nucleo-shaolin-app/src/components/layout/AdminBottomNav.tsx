'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

interface NavItem {
  label: string
  path: string
  icon: string
  badge?: number
}

interface AdminBottomNavProps {
  pendingCount?: number
  pendingExamsCount?: number
  role?: string
}

export function AdminBottomNav({
  pendingCount = 0,
  pendingExamsCount = 0,
  role = 'instructor',
}: AdminBottomNavProps) {
  const pathname = usePathname()

  const isSifu = role === 'super_admin'

  const navItems: NavItem[] = useMemo(
    () =>
      isSifu
        ? [
            {
              label: 'Painel',
              path: '/admin',
              icon: '🏠',
              badge: pendingCount > 0 ? pendingCount : undefined,
            },
            {
              label: 'Alunos',
              path: '/admin/alunos',
              icon: '👥',
            },
            {
              label: 'Horários',
              path: '/admin/horarios',
              icon: '📅',
            },
            {
              label: 'Avisos',
              path: '/admin/avisos',
              icon: '📢',
            },
            {
              label: 'Exames',
              path: '/admin/exames',
              icon: '🥋',
              badge: pendingExamsCount > 0 ? pendingExamsCount : undefined,
            },
          ]
        : [
            {
              label: 'Painel',
              path: '/admin',
              icon: '🏠',
            },
            {
              label: 'Alunos',
              path: '/admin/alunos',
              icon: '👥',
            },
            {
              label: 'Aulas',
              path: '/admin/horarios',
              icon: '📅',
            },
            {
              label: 'Exames',
              path: '/admin/exames',
              icon: '🥋',
            },
          ],
    [isSifu, pendingCount, pendingExamsCount]
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-md border-t border-[var(--color-border)] px-4 py-2 flex justify-around items-center max-w-md mx-auto shadow-lg transition-all">
      {navItems.map((item) => {
        const isActive =
          item.path === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.path)

        return (
          <Link
            key={item.path}
            href={item.path}
            prefetch={true}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-[var(--radius-sm)] transition-all min-w-[62px] ${
              isActive
                ? 'text-[var(--color-gold)] font-bold scale-105'
                : 'text-muted hover:text-main'
            }`}
          >
            <span className="text-xl mb-0.5 relative">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </span>
            <span className="nkfs-tag-p tracking-tight leading-none text-center">
              {item.label}
            </span>
            {isActive && (
              <span className="absolute -bottom-1 w-4 h-0.5 bg-[var(--color-gold)] rounded-full animate-fade-in" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
