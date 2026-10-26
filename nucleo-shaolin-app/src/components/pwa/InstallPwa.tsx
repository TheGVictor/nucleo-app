'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Captura imediata no nível de módulo para não perder o evento disparado antes da hidratação
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    globalDeferredPrompt = e as BeforeInstallPromptEvent
  })
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
  const pathname = usePathname()
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [showAndroidGuide, setShowAndroidGuide] = useState(false)

  // 1. Rota permitida: exclusivo para /login e áreas internas (/aluno, /admin, /aguardando)
  // O site público (/, /cadastro, etc.) NUNCA exibirá o prompt para visitantes comuns.
  const isAllowedRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/aluno') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/aguardando')

  useEffect(() => {
    // Registra o Service Worker apenas no cliente
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (!isAllowedRoute || isStandalone) return

    // 2. Detecção de dispositivo móvel
    const ua = navigator.userAgent || ''
    const iosDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))
    const androidDevice = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isMobileWidth = window.matchMedia('(max-width: 820px)').matches

    const mobileDetected = (iosDevice || androidDevice || isTouch) && isMobileWidth
    setIsMobile(mobileDetected)
    setIsIOS(iosDevice)

    if (!mobileDetected) return

    // 3. Verifica se o usuário já dispensou nas últimas 24 horas (em vez de travar por 7 dias)
    const dismissedAt = localStorage.getItem('nkfs_pwa_dismissed')
    const now = Date.now()
    const isDismissedRecently =
      dismissedAt && now - parseInt(dismissedAt, 10) < 24 * 60 * 60 * 1000

    if (isDismissedRecently) return

    // Se já temos o evento capturado globalmente, podemos abrir o prompt
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt)
      setShowPrompt(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      globalDeferredPrompt = e as BeforeInstallPromptEvent
      setDeferredPrompt(globalDeferredPrompt)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Timer de auxílio para iOS ou navegadores móveis sem evento automático
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 1500)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [isAllowedRoute, isStandalone])

  // Se rota não permitida, já é app instalado, não é mobile, ou prompt fechado: não renderiza
  if (!isAllowedRoute || isStandalone || !isMobile || !showPrompt) return null

  // Botão NÃO: fecha e silencia apenas por 24 horas
  function handleNo() {
    setShowPrompt(false)
    localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
  }

  // Botão SIM: leva direto à decisão do SO (sem abrir folha de compartilhar!)
  async function handleYes() {
    const activePrompt = deferredPrompt || globalDeferredPrompt

    if (activePrompt) {
      // No Android com evento: Dispara a janela nativa do SO diretamente
      setShowPrompt(false)
      try {
        await activePrompt.prompt()
        const choice = await activePrompt.userChoice
        if (choice.outcome === 'accepted') {
          localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
        }
      } catch {
        // Silencioso
      }
      setDeferredPrompt(null)
      globalDeferredPrompt = null
    } else if (isIOS) {
      // No iPhone/Safari: Apple exige ação pelo botão nativo do Safari
      setShowIOSGuide(true)
    } else {
      // No Android sem evento capturado na hora: Exibe guia de 2 toques no Chrome
      setShowAndroidGuide(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar Núcleo Shaolin à tela inicial"
        className="w-full max-w-sm bg-[var(--color-bg)] border-2 border-[var(--color-border-gold)]/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center animate-scale-up"
      >
        {!showIOSGuide && !showAndroidGuide ? (
          <>
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
                Acesso com 1 toque direto na sua tela inicial como um aplicativo.
              </p>
            </div>

            {/* APENAS DOIS BOTÕES GRANDES: NÃO OU SIM */}
            <div className="grid grid-cols-2 gap-3 pt-2">
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
          </>
        ) : showIOSGuide ? (
          /* Instrução objetiva no iPhone quando o usuário confirma SIM */
          <div className="flex flex-col items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-2xl flex items-center justify-center self-center">
              📲
            </div>
            <div className="w-full text-center">
              <h3 className="text-lg font-extrabold text-main">
                Para adicionar no iPhone:
              </h3>
              <p className="text-xs text-muted mt-0.5">
                O Safari requer estes 2 passos:
              </p>
            </div>

            <div className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-3.5 flex flex-col gap-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-black font-black flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p className="text-main leading-tight">
                  Toque no ícone de <strong>Compartilhar</strong> (<span className="font-semibold text-gold">⎋</span> na barra inferior do Safari).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-black font-black flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p className="text-main leading-tight">
                  Role a lista e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong> (<span className="font-semibold text-gold">➕</span>).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPrompt(false)
                localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
              }}
              className="btn btn-gold w-full min-h-[46px] font-bold text-sm mt-1 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        ) : (
          /* Instrução de auxílio no Android Chrome */
          <div className="flex flex-col items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-2xl flex items-center justify-center self-center">
              📲
            </div>
            <div className="w-full text-center">
              <h3 className="text-lg font-extrabold text-main">
                Adicionar no Android:
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Siga estes 2 passos no Chrome:
              </p>
            </div>

            <div className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-3.5 flex flex-col gap-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-black font-black flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p className="text-main leading-tight">
                  Toque no menu de <strong>3 pontinhos</strong> (<span className="font-bold text-gold">⋮</span> no canto superior direito do navegador).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-black font-black flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p className="text-main leading-tight">
                  Selecione <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong> (<span className="font-bold text-gold">📲</span>).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPrompt(false)
                localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
              }}
              className="btn btn-gold w-full min-h-[46px] font-bold text-sm mt-1 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Botão direto reutilizável para o Perfil do Aluno
 * Permite que o aluno instale a qualquer momento com 1 clique!
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt)
  const [modalType, setModalType] = useState<'ios' | 'android' | 'desktop' | null>(null)

  useEffect(() => {
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      globalDeferredPrompt = e as BeforeInstallPromptEvent
      setDeferredPrompt(globalDeferredPrompt)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (isStandalone) {
    return (
      <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-3 rounded-xl shadow-xs">
        <span className="text-base">✓</span>
        <span>Aplicativo instalado e ativo na sua tela inicial!</span>
      </div>
    )
  }

  async function handleClick() {
    const activePrompt = deferredPrompt || globalDeferredPrompt

    if (activePrompt) {
      try {
        await activePrompt.prompt()
        await activePrompt.userChoice
      } catch {
        // Silencioso
      }
      setDeferredPrompt(null)
      globalDeferredPrompt = null
      return
    }

    // Detecção de plataforma para instruir com precisão cirúrgica
    const ua = navigator.userAgent || ''
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))
    const isAndroid = /Android|webOS/i.test(ua)

    if (isIOS) {
      setModalType('ios')
    } else if (isAndroid) {
      setModalType('android')
    } else {
      setModalType('desktop')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`btn btn-gold btn-full flex items-center justify-center gap-2 text-sm font-extrabold min-h-[48px] shadow-sm hover:scale-[1.01] transition-all cursor-pointer ${className}`}
      >
        <span className="text-lg">📲</span>
        <span>Adicionar à Tela Inicial</span>
      </button>

      {/* Modal Guiado quando o clique manual for acionado */}
      {modalType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="w-full max-w-sm bg-[var(--color-bg)] border-2 border-[var(--color-border-gold)] rounded-2xl p-5 shadow-2xl flex flex-col gap-3.5 text-left animate-scale-up">
            <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
              <h3 className="text-base font-extrabold text-main flex items-center gap-2">
                <span>📲</span>
                <span>
                  {modalType === 'ios'
                    ? 'Instalar no iPhone (Safari)'
                    : modalType === 'android'
                    ? 'Instalar no Android (Chrome)'
                    : 'Instalar no Computador'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-muted hover:text-main p-1"
              >
                ✕
              </button>
            </div>

            {modalType === 'ios' && (
              <div className="flex flex-col gap-2.5 text-xs text-muted">
                <p className="text-main font-semibold">
                  Siga os 2 passos no Safari:
                </p>
                <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <strong className="text-gold">1.</strong>
                    <span>Toque no ícone de <strong>Compartilhar</strong> (<span className="text-gold font-bold">⎋</span> na barra inferior do Safari).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <strong className="text-gold">2.</strong>
                    <span>Role para baixo e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong> (<span className="text-gold font-bold">➕</span>).</span>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'android' && (
              <div className="flex flex-col gap-2.5 text-xs text-muted">
                <p className="text-main font-semibold">
                  Siga os 2 passos no Chrome:
                </p>
                <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <strong className="text-gold">1.</strong>
                    <span>Toque nos <strong>3 pontinhos</strong> (<span className="text-gold font-bold">⋮</span> no canto superior direito).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <strong className="text-gold">2.</strong>
                    <span>Toque em <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.</span>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'desktop' && (
              <div className="flex flex-col gap-2 text-xs text-muted leading-relaxed">
                <p>
                  No seu navegador (Chrome ou Edge), clique no ícone de <strong>Instalar</strong> (ícone de computador ou <span className="font-bold text-gold">⊕</span>) localizado na <strong>barra de endereços / URL</strong> no topo da tela.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setModalType(null)}
              className="btn btn-gold btn-sm w-full mt-2 font-bold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
