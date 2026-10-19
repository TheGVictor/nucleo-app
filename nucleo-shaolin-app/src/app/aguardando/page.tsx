'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AguardandoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [status, setStatus] = useState<'pending_approval' | 'active' | 'rejected' | 'loading'>('loading')
  const [studentName, setStudentName] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)

  const [isChecking, setIsChecking] = useState(false)

  // Efeito para contagem regressiva suave após aprovação
  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => (prev !== null ? prev - 1 : 0)), 1000)
      return () => clearTimeout(timer)
    }

    if (countdown === 0) {
      router.push('/aluno')
    }
  }, [countdown, router])

  async function checkStatus(isManual = false) {
    if (isManual) setIsChecking(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, status')
        .eq('id', user.id)
        .single()

      if (profile) {
        setStudentName(profile.full_name)
      }

      const { data: studentModality } = await supabase
        .from('student_modalities')
        .select('status')
        .eq('student_id', user.id)
        .maybeSingle()

      const currentStatus = studentModality?.status ?? profile?.status ?? 'pending_approval'
      if (currentStatus === 'active' || currentStatus === 'rejected') {
        setStatus(currentStatus)
      } else {
        setStatus('pending_approval')
      }

      if (currentStatus === 'active') {
        setCountdown(3)
      }
    } catch {
      // Falha silenciosa em checagem de fundo
    } finally {
      if (isManual) setIsChecking(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, status')
          .eq('id', user.id)
          .single()

        if (!ignore && profile) {
          setStudentName(profile.full_name)
        }

        const { data: studentModality } = await supabase
          .from('student_modalities')
          .select('status')
          .eq('student_id', user.id)
          .maybeSingle()

        const currentStatus = studentModality?.status ?? profile?.status ?? 'pending_approval'
        if (!ignore) {
          if (currentStatus === 'active' || currentStatus === 'rejected') {
            setStatus(currentStatus)
          } else {
            setStatus('pending_approval')
          }

          if (currentStatus === 'active') {
            setCountdown(3)
          }
        }
      } catch {
        // Falha silenciosa
      }
    }

    loadInitialStatus()

    // Verificação periódica suave (a cada 30s) somente se a aba estiver visível
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkStatus()
      }
    }, 30000)

    return () => {
      ignore = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="nkfs-p-p text-muted animate-pulse">Carregando status do cadastro...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="card w-full max-w-sm text-center p-6 sm:p-8 shadow-2xl flex flex-col items-center animate-fade-in">
        
        {/* Símbolo Oficial Shaolin */}
        <Logo size="xl" priority />

        {/* ── ESTADO 1: PENDENTE ── */}
        {status === 'pending_approval' && (
          <div className="flex flex-col items-center w-full mt-4">
            <Badge variant="warning">⏳ Em Homologação</Badge>
            
            <h1 className="nkfs-h-m text-main mt-3">Cadastro Pendente</h1>
            <p className="nkfs-tag-p text-muted mt-1">Núcleo de Kung Fu Shaolin</p>
            
            <div className="card-elevated p-4 my-5 w-full text-left">
              <p className="nkfs-p-p text-muted leading-relaxed">
                Olá, <strong className="text-main">{studentName}</strong>! Sua solicitação de matrícula e nível autodeclarado estão sob análise técnica do Sifu Guilherme.
              </p>
            </div>
            
            <div className="alert alert-warning text-left w-full">
              <span className="text-sm">ℹ️</span>
              <p className="nkfs-p-p leading-tight">
                Assim que sua matrícula for aprovada pelo Sifu, o acesso será liberado automaticamente.
              </p>
            </div>

            <div className="mt-5 w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => checkStatus(true)}
                disabled={isChecking}
                className="btn btn-primary btn-full flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <Spinner size="sm" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Verificar Aprovação Agora</span>
                  </>
                )}
              </button>

              <Link href="/login" className="btn btn-outline btn-sm btn-full text-center">
                Sair / Voltar ao Login
              </Link>
            </div>
          </div>
        )}

        {/* ── ESTADO 2: APROVADO COM CONTAGEM REGRESSIVA ── */}
        {status === 'active' && (
          <div className="flex flex-col items-center w-full mt-4">
            <Badge variant="success">✅ Matrícula Aprovada</Badge>
            
            <h1 className="nkfs-h-m text-main mt-3">Cadastro Aprovado!</h1>
            <p className="nkfs-p-p text-success mt-1">
              Bem-vindo ao Núcleo de Kung Fu Shaolin
            </p>
            
            <div className="card-gold p-4 my-5 w-full">
              <p className="nkfs-p-p text-muted leading-relaxed">
                Sua faixa e matrícula foram homologadas com sucesso pelo Sifu!
              </p>
              
              {countdown !== null && (
                <div className="mt-4 pt-3 border-t border-[var(--color-border-gold)] flex flex-col items-center gap-1">
                  <span className="nkfs-tag-p text-muted uppercase">
                    Redirecionando em
                  </span>
                  <span className="nkfs-h-g text-gold font-mono animate-pulse">
                    {countdown}s
                  </span>
                </div>
              )}
            </div>

            <Link
              href="/aluno"
              className="btn btn-primary btn-full btn-lg"
            >
              Acessar Área do Aluno Agora
            </Link>
          </div>
        )}

        {/* ── ESTADO 3: REPROVADO ── */}
        {status === 'rejected' && (
          <div className="flex flex-col items-center w-full mt-4">
            <Badge variant="error">❌ Não Homologado</Badge>
            
            <h1 className="nkfs-h-m text-main mt-3">Solicitação Não Aprovada</h1>
            <p className="nkfs-tag-p text-muted mt-1">Núcleo de Kung Fu Shaolin</p>
            
            <div className="card-elevated p-4 my-5 w-full text-left">
              <p className="nkfs-p-p text-muted leading-relaxed">
                Sua solicitação de matrícula necessita de ajustes ou contato com a academia. Entre em contato diretamente com a secretaria ou com o Sifu.
              </p>
            </div>

            <Link
              href="/login"
              className="btn btn-outline btn-full"
            >
              Voltar ao Login
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}