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
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // 1. Registra o Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (isStandalone) return

    // 2. Verifica se o usuário já dispensou (NÃO) nos últimos 7 dias
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

    // 4. No iOS ou navegadores móveis onde o evento não dispara nativamente
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

  // Botão NÃO: apenas fecha sem adicionar
  function handleNo() {
    setShowPrompt(false)
    setShowIOSGuide(false)
    localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
  }

  // Botão SIM: adiciona direto no Android ou mostra instrução simples no iOS
  async function handleYes() {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setShowPrompt(false)
        }
      } catch {
        // Fallback silencioso
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      setShowIOSGuide(true)
    } else {
      setShowIOSGuide(true)
    }
  }

  // Se já estiver rodando como app instalado, não exibe nada
  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar aplicativo Núcleo Shaolin"
        className="w-full max-w-md bg-[var(--color-bg)] border-2 border-[var(--color-border-gold)]/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-center animate-scale-up"
      >
        {!showIOSGuide ? (
          /* ── TELA PRINCIPAL: PERGUNTA DIRETA SIM OU NÃO ── */
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/40 flex items-center justify-center text-3xl shadow-sm">
                🥋
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-main leading-tight tracking-tight mt-1">
                Adicionar à tela do celular?
              </h2>
              <p className="text-base font-bold text-gold">
                Núcleo Shaolin
              </p>
              <p className="text-sm text-muted mt-1 leading-relaxed max-w-xs">
                Fica igual a um aplicativo normal para você entrar com 1 toque, sem precisar abrir o navegador.
              </p>
            </div>

            {/* BOTÕES GRANDES E DIRETOS: SIM OU NÃO */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={handleNo}
                className="min-h-[52px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-surface-hover)] text-main font-bold text-base transition-colors flex items-center justify-center cursor-pointer"
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
          </>
        ) : (
          /* ── GUIA VISUAL SIMPLES PARA IPHONE / SAFARI ── */
          <>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">📱</span>
              <h2 className="text-lg sm:text-xl font-black text-main leading-tight">
                Como colocar no seu iPhone
              </h2>
              <p className="text-xs text-muted">
                Siga apenas estes 2 passos no Safari:
              </p>
            </div>

            <div className="flex flex-col gap-3 text-left my-1">
              <div className="flex items-center gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </span>
                <p className="text-sm font-semibold text-main leading-snug">
                  Toque no botão <strong className="text-amber-500">Compartilhar</strong> (o ícone <span className="text-lg">📤</span> na barra inferior).
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </span>
                <p className="text-sm font-semibold text-main leading-snug">
                  Escolha <strong className="text-amber-500">&quot;Adicionar à Tela de Início&quot;</strong> (o ícone <span className="text-lg">➕</span>).
                </p>
              </div>
            </div>

            <p className="text-xs text-muted font-medium">
              O ícone será adicionado com o nome <strong>Núcleo Shaolin</strong>.
            </p>

            <button
              type="button"
              onClick={handleNo}
              className="min-h-[48px] w-full px-4 py-2.5 rounded-xl bg-gold hover:bg-amber-600 text-white font-bold text-base transition-colors cursor-pointer mt-1"
            >
              ENTENDI, FECHAR
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Botão dedicado reutilizável (ex: no Perfil do Aluno)
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-start justify-between">
              <h3 className="nkfs-h-p text-main font-bold">
                {isIOS ? 'Como adicionar no iPhone' : 'Como adicionar no Android'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted p-1 text-lg">✕</button>
            </div>
            {isIOS ? (
              <div className="flex flex-col gap-2 text-xs text-muted">
                <p>1. Toque no ícone Compartilhar (<strong>📤</strong>) na barra inferior do Safari.</p>
                <p>2. Toque em <strong>&quot;Adicionar à Tela de Início&quot; (➕)</strong>.</p>
                <p>3. Toque em &quot;Adicionar&quot; no topo direito.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-xs text-muted">
                <p>1. Toque nos 3 pontos (<strong>⋮</strong>) no canto superior do navegador.</p>
                <p>2. Selecione <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.</p>
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-primary btn-sm btn-full mt-2 font-bold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
