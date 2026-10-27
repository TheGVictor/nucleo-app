'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshFichaButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [justRefreshed, setJustRefreshed] = useState(false)

  // 1. Atualização automática ao carregar a tela e ao focar no app (PWA / Mobile)
  useEffect(() => {
    // Refresh ao montar o componente
    startTransition(() => {
      router.refresh()
    })

    // Refresh quando o usuário volta para o app ou para a aba
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        startTransition(() => {
          router.refresh()
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  function handleManualRefresh() {
    startTransition(() => {
      router.refresh()
      setJustRefreshed(true)
      setTimeout(() => setJustRefreshed(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleManualRefresh}
      disabled={isPending}
      className="btn btn-outline btn-sm text-xs font-semibold px-2.5 py-1.5 flex items-center gap-1.5 border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-gold transition-all"
      title="Buscar atualizações mais recentes do Sifu"
    >
      <span className={`text-sm ${isPending ? 'animate-spin' : ''}`}>
        🔄
      </span>
      <span>
        {isPending
          ? 'Atualizando...'
          : justRefreshed
          ? '✓ Atualizado'
          : 'Atualizar Ficha'}
      </span>
    </button>
  )
}
