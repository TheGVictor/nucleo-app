'use client'

import { usePathname, useRouter } from 'next/navigation'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const ALUNO_NAV: NavItem[] = [
  {
    label: 'Início',
    path: '/aluno',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Ficha',
    path: '/aluno/ficha',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'Vídeos',
    path: '/aluno/videos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    label: 'Perfil',
    path: '/aluno/perfil',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="bottom-nav">
      {ALUNO_NAV.map(item => {
        const active = pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}