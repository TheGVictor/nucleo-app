'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getSnapshot(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot(): boolean {
  return false
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggleTheme() {
    const nextDark = !isDark
    if (nextDark) {
      document.documentElement.classList.add('dark')
      try {
        localStorage.setItem('theme', 'dark')
      } catch {}
    } else {
      document.documentElement.classList.remove('dark')
      try {
        localStorage.setItem('theme', 'light')
      } catch {}
    }
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] hover:border-[var(--color-primary)] transition-all shadow-sm ${className}`}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {isDark ? (
        // Ícone Sol (para voltar ao modo claro)
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // Ícone Lua (para ir para o modo escuro)
        <svg
          className="w-4 h-4 text-slate-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
