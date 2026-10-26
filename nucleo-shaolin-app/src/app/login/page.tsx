'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { Spinner } from '@/components/ui/Spinner'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'instructor') {
      router.push('/admin')
    } else if (profile?.status === 'pending_approval') {
      router.push('/aguardando')
    } else if (profile?.status === 'active') {
      router.push('/aluno')
    } else {
      setError('Conta suspensa ou recusada. Entre em contato com a escola.')
      await supabase.auth.signOut()
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        
        {/* Logo Oficial Shaolin */}
        <div className="flex flex-col items-center mb-6">
          <Logo size="xl" priority className="mb-1" />
          <h1 className="nkfs-h-m text-main tracking-tight mt-3 text-center">
            Núcleo de Kung Fu Shaolin
          </h1>
          <p className="nkfs-p-m text-muted mt-1 text-center">Área do Aluno</p>
        </div>

        {/* Card Formulário */}
        <div className="card shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="field">
              <label className="label nkfs-tag-p text-muted" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="label nkfs-tag-p text-muted" htmlFor="password">Senha</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors p-1 flex items-center justify-center focus:outline-none"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                <span>⚠</span>
                <span className="nkfs-p-p">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg mt-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center nkfs-p-m text-muted mt-6">
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="text-gold hover:underline font-semibold">
            Fazer cadastro
          </Link>
        </p>

        <div className="text-center mt-3">
          <Link href="/" className="nkfs-tag-p text-faint hover:text-muted transition-colors">
            ← Voltar para a página inicial
          </Link>
        </div>

      </div>
    </main>
  )
}