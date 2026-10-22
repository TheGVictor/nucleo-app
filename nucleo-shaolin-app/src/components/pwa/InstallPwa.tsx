'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

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

    // 2. Detecção estrita de Mobile (Smartphones / Tablets)
    // Versões Desktop NÃO terão isso de forma alguma.
    const ua = navigator.userAgent || ''
    const iosDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))
    const androidDevice = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isMobileWidth = window.matchMedia('(max-width: 820px)').matches

    const mobileDetected = (iosDevice || androidDevice || isTouch) && isMobileWidth
    setIsMobile(mobileDetected)
    setIsIOS(iosDevice)

    if (!mobileDetected) return

    // 3. Verifica se o usuário já dispensou (NÃO) nos últimos 7 dias
    const dismissedAt = localStorage.getItem('nkfs_pwa_dismissed')
    const now = Date.now()
    const isDismissedRecently =
      dismissedAt && now - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000

    if (isDismissedRecently) return

    // 4. Android / Chrome: Captura o evento nativo de instalação do SO
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 5. iOS Safari: Não possui o evento beforeinstallprompt
    let iosTimer: NodeJS.Timeout | null = null
    if (iosDevice) {
      iosTimer = setTimeout(() => {
        setShowPrompt(true)
      }, 1500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [isAllowedRoute, isStandalone])

  // Se rota não permitida, já é app instalado, não é mobile, ou prompt fechado: não renderiza
  if (!isAllowedRoute || isStandalone || !isMobile || !showPrompt) return null

  // Botão NÃO: fecha e não pergunta pelos próximos 7 dias
  function handleNo() {
    setShowPrompt(false)
    localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
  }

  // Botão SIM: leva direto à decisão do SO (sem abrir folha de compartilhar!)
  async function handleYes() {
    if (deferredPrompt) {
      // No Android: Dispara a janela nativa do SO diretamente
      setShowPrompt(false)
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          localStorage.setItem('nkfs_pwa_dismissed', Date.now().toString())
        }
      } catch {
        // Silencioso
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      // No iPhone/Safari: Apple não disponibiliza API JS para forçar o diálogo nativo.
      // Em vez de chamar navigator.share (que abre compartilhamento indesejado),
      // exibe a instrução visual de 2 passos no Safari.
      setShowIOSGuide(true)
    } else {
      setShowPrompt(false)
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
        {!showIOSGuide ? (
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
        ) : (
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
        )}
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
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent || ''
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))
    setIsIOS(ios)

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
    } else if (isIOS) {
      setShowIOSModal(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`btn btn-outline btn-full flex items-center justify-center gap-2 text-sm font-bold min-h-[46px] border-[var(--color-gold)] text-gold hover:bg-gold/10 cursor-pointer ${className}`}
      >
        <span>📲</span>
        <span>Adicionar à Tela Inicial</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--color-bg)] border border-[var(--color-border-gold)] rounded-2xl p-5 shadow-2xl flex flex-col gap-3 text-left">
            <h3 className="text-base font-bold text-main">Adicionar no iPhone (Safari)</h3>
            <p className="text-xs text-muted">
              1. Toque no ícone de <strong>Compartilhar</strong> (⎋) na barra inferior.<br />
              2. Selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong> (➕).
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="btn btn-gold btn-sm w-full mt-2 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
