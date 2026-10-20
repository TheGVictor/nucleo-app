'use client'

import { useEffect, useState, useSyncExternalStore, useMemo } from 'react'

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

  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
  }, [])

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    // 1. Registra o Service Worker (passivo para habilitar PWA completo)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silencioso
      })
    }

    if (isStandalone) return

    // 2. Verifica se foi dispensado nos últimos 7 dias
    const dismissedAt = localStorage.getItem('nkfs_pwa_dismissed')
    const now = Date.now()
    const isDismissedRecently =
      dismissedAt && now - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000

    // 3. Escuta evento nativo de instalação no Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!isDismissedRecently) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 4. Se for iOS e não tiver sido dispensado, exibe banner educativo suave
    let timer: NodeJS.Timeout | null = null
    if (isIOS && !isDismissedRecently) {
      timer = setTimeout(() => {
        setShowBanner(true)
      }, 1500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (timer) clearTimeout(timer)
    }
  }, [isStandalone, isIOS])

  function handleDismiss() {
    setShowBanner(false)
    localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
  }

  async function handleInstallClick() {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setShowBanner(false)
        }
      } catch {
        // Falha no prompt nativo
      }
      setDeferredPrompt(null)
    } else {
      setShowIOSModal(true)
    }
  }

  if (isStandalone) return null

  return (
    <>
      {/* ── BANNER FIXO INFERIOR / CARD DISCRETO ── */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Instalar aplicativo"
          className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border-gold)]/60 rounded-[var(--radius-lg)] p-4 shadow-2xl animate-fade-in flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center text-xl shrink-0">
                🥋
              </div>
              <div>
                <h3 className="nkfs-h-p text-main text-sm font-bold leading-tight">
                  Adicionar à Tela Inicial
                </h3>
                <p className="text-xs text-muted mt-0.5 leading-snug">
                  Abra o Núcleo Shaolin com 1 toque, em tela cheia como um aplicativo.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Dispensar aviso de instalação"
              className="text-muted hover:text-main text-lg leading-none p-1 rounded-md transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleInstallClick}
              className="btn btn-primary btn-sm flex-1 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>📲</span>
              <span>Instalar Agora</span>
            </button>
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm text-xs text-muted"
            >
              Agora não
            </button>
          </div>
        </aside>
      )}

      {/* ── MODAL COM INSTRUÇÕES DE INSTALAÇÃO (ESPECIAL PARA IPHONE / SAFARI) ── */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 text-left relative animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <span className="nkfs-tag-p text-gold font-bold uppercase tracking-wider">
                  Como Instalar no Celular
                </span>
                <h2 className="nkfs-h-m text-main font-extrabold mt-1">
                  Adicionar à Tela de Início
                </h2>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-muted hover:text-main p-1.5 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            {isIOS ? (
              /* Passo a passo iOS */
              <div className="flex flex-col gap-4 text-sm text-main">
                <p className="text-xs text-muted">
                  No Safari do iPhone/iPad, a Apple requer que você siga estes 3 passos rápidos:
                </p>

                <div className="flex items-start gap-3 bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
                  <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-main">Toque no botão Compartilhar</p>
                    <p className="text-xs text-muted mt-0.5">
                      É o ícone de quadrado com a seta para cima (
                      <span className="text-base text-gold font-bold">⎋</span> ou{' '}
                      <span className="text-base text-gold">📤</span>) na barra inferior do Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
                  <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-main">Role e escolha &quot;Adicionar à Tela de Início&quot;</p>
                    <p className="text-xs text-muted mt-0.5">
                      Procure pelo ícone de quadrado com sinal de mais (
                      <span className="text-base text-gold font-bold">➕</span>) no menu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
                  <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-main">Toque em &quot;Adicionar&quot;</p>
                    <p className="text-xs text-muted mt-0.5">
                      Fica no canto superior direito da tela. O ícone oficial do Núcleo Shaolin aparecerá junto aos seus outros apps!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Passo a passo Android genérico / Chrome */
              <div className="flex flex-col gap-4 text-sm text-main">
                <div className="flex items-start gap-3 bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
                  <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-main">Abra o menu do navegador</p>
                    <p className="text-xs text-muted mt-0.5">
                      Toque nos 3 pontinhos (<strong className="text-gold">⋮</strong>) no canto superior direito do Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
                  <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-main">Selecione &quot;Instalar aplicativo&quot;</p>
                    <p className="text-xs text-muted mt-0.5">
                      Ou toque em &quot;Adicionar à tela inicial&quot;.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSModal(false)}
              className="btn btn-primary btn-full font-bold mt-2"
            >
              Entendi, obrigado!
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Botão dedicado reutilizável que pode ser colocado em qualquer página
 * (ex: no Perfil do Aluno ou configurações)
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showModal, setShowModal] = useState(false)

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
    } else {
      setShowModal(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`btn btn-outline btn-full flex items-center justify-center gap-2 text-xs font-bold border-[var(--color-gold)] text-gold hover:bg-gold/10 ${className}`}
      >
        <span>📲</span>
        <span>Adicionar à Tela Inicial</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-start justify-between">
              <h3 className="nkfs-h-p text-main font-bold">Como adicionar à Tela Inicial</h3>
              <button onClick={() => setShowModal(false)} className="text-muted p-1">✕</button>
            </div>
            <p className="text-xs text-muted">
              <strong>No iPhone (Safari):</strong> Toque no ícone Compartilhar (📤) e escolha <strong>&quot;Adicionar à Tela de Início&quot; (➕)</strong>.
            </p>
            <p className="text-xs text-muted">
              <strong>No Android (Chrome):</strong> Toque nos 3 pontos (⋮) e escolha <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.
            </p>
            <button onClick={() => setShowModal(false)} className="btn btn-primary btn-sm btn-full mt-2">
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
