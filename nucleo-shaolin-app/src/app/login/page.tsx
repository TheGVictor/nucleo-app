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

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

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

    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
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