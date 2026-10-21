'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getStandaloneSnapshot() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function getStandaloneServerSnapshot() {
  return false
}

export function InstallPwa() {
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. Registra o Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (isStandalone) return

    // 2. Se o usuário já dispensou (NÃO) nos últimos 7 dias, não incomoda
    const dismissedAt = localStorage.getItem('nkfs_pwa_dismissed')
    const now = Date.now()
    const isDismissedRecently =
      dismissedAt && now - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000

    // 3. Captura o evento nativo de instalação no Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!isDismissedRecently) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 4. Se for dispositivo móvel que não dispara o evento nativo (como iOS Safari)
    let timer: NodeJS.Timeout | null = null
    if (!isDismissedRecently) {
      timer = setTimeout(() => {
        setShowPrompt(true)
      }, 1000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (timer) clearTimeout(timer)
    }
  }, [isStandalone])

  // Botão NÃO: só não adiciona e fecha direto
  function handleNo() {
    setShowPrompt(false)
    localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
  }

  // Botão SIM: dispara direto a ação do sistema para adicionar à tela inicial
  async function handleYes() {
    setShowPrompt(false)

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        await deferredPrompt.userChoice
      } catch {
        // Fallback silencioso
      }
      setDeferredPrompt(null)
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      // No iPhone/Safari, abre direto a folha nativa do sistema onde está a opção de adicionar à tela inicial
      try {
        await navigator.share({
          title: 'Núcleo Shaolin',
          url: window.location.href,
        })
      } catch {
        // Usuário fechou a folha nativa
      }
    }
  }

  // Se já for app instalado ou prompt fechado, não renderiza nada
  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar Núcleo Shaolin à tela inicial"
        className="w-full max-w-sm bg-[var(--color-bg)] border-2 border-[var(--color-border-gold)]/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-center animate-scale-up"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-3xl shadow-sm">
            🥋
          </div>
          <h2 className="text-xl font-black text-main leading-tight mt-1">
            Adicionar à tela do celular?
          </h2>
          <p className="text-base font-extrabold text-gold">
            Núcleo Shaolin
          </p>
          <p className="text-sm text-muted leading-snug">
            Acesso com 1 toque direto na sua tela inicial.
          </p>
        </div>

        {/* APENAS DOIS BOTÕES GRANDES: NÃO OU SIM */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleNo}
            className="min-h-[52px] px-4 py-3 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-surface-hover)] text-main font-bold text-base transition-colors flex items-center justify-center cursor-pointer active:scale-95"
          >
            NÃO
          </button>

          <button
            type="button"
            onClick={handleYes}
            className="min-h-[52px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📲</span>
            <span>SIM</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Botão direto reutilizável (ex: no Perfil do Aluno)
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (isStandalone) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
        <span>✅</span>
        <span>App já instalado na tela inicial</span>
      </div>
    )
  }

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      setDeferredPrompt(null)
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Núcleo Shaolin',
          url: window.location.href,
        })
      } catch {}
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`btn btn-outline btn-full flex items-center justify-center gap-2 text-sm font-bold min-h-[46px] border-[var(--color-gold)] text-gold hover:bg-gold/10 ${className}`}
    >
      <span>📲</span>
      <span>Adicionar à Tela Inicial</span>
    </button>
  )
}
