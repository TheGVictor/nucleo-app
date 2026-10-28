'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { Spinner } from '@/components/ui/Spinner'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const MODALITIES = [
  { slug: 'clf',      label: 'Choy Lay Fut',  short: 'CLF' },
  { slug: 'taichi',   label: 'Tai Chi Chuan', short: 'Tai Chi' },
  { slug: 'tanglang', label: 'Tang Lang',     short: 'TL' },
  { slug: 'sanda',    label: 'Sanda',         short: 'Sanda' },
]

const GRADUATIONS_BY_MODALITY: Record<string, string[]> = {
  clf: ['Faixa Branca','Faixa Amarela','Faixa Laranja','Faixa Verde-Jade','Faixa Verde Escura','Faixa Roxa','Faixa Vermelha','Faixa Marrom Clara','Faixa Marrom Avançada','Faixa Preta','Faixa Preta 1º Grau','Faixa Preta 2º Grau','Faixa Preta 3º Grau','Faixa Preta 4º Grau','Faixa Preta 5º Grau'],
  taichi: ['Wu Hao de 8','Wu Hao de 13','Wu Hao de 24','Wu Hao de 35','Espada Reta','Wu Hao de 38'],
  tanglang: ['Faixa Branca','Faixa Amarela','Faixa Laranja','Faixa Verde-Jade','Faixa Verde Escura','Faixa Roxa','Faixa Vermelha','Faixa Marrom Clara','Faixa Marrom Avançada','Faixa Preta','Faixa Preta 1º Grau','Faixa Preta 2º Grau','Faixa Preta 3º Grau','Faixa Preta 4º Grau','Faixa Preta 5º Grau'],
  sanda: ['Branco','Amarelo','Amarelo Ponta Verde','Verde','Verde Ponta Azul','Azul','Azul Ponta Vermelha','Vermelho','Vermelho Ponta Preta','Preto'],
}

export default function CadastroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — dados pessoais
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 2 — modalidades
  const [selectedModalities, setSelectedModalities] = useState<string[]>([])
  const [selfReported, setSelfReported] = useState<Record<string, string>>({})

  // Step 3 — termos
  const [terms, setTerms] = useState(false)
  const [imageRights, setImageRights] = useState(false)
  const [health, setHealth] = useState(false)

  function toggleModality(slug: string) {
    setSelectedModalities(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!terms || !imageRights || !health) {
      setError('Aceite todos os termos para continuar.')
      return
    }
    if (selectedModalities.length === 0) {
      setError('Selecione ao menos uma modalidade.')
      return
    }

    setLoading(true)
    setError(null)

    // 1. Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          birth_date: birthDate,
        },
      },
    })

    if (authError || !authData.user) {
      setError(authError?.message ?? 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // 2. Atualiza o profile criado pelo trigger com os campos extras
    await supabase
      .from('profiles')
      .update({
        terms_accepted: terms,
        image_rights_accepted: imageRights,
        health_declaration_accepted: health,
      })
      .eq('id', userId)

    // 3. Busca IDs das modalidades selecionadas
    const { data: modalitiesData } = await supabase
      .from('modalities')
      .select('id, slug')
      .in('slug', selectedModalities)

    if (modalitiesData) {
      const inserts = (modalitiesData as { id: string; slug: string }[]).map(m => ({
        student_id: userId,
        modality_id: m.id,
        self_reported_level: selfReported[m.slug] ?? null,
        status: 'pending_approval' as const,
      }))

      await supabase.from('student_modalities').insert(inserts)
    }

    router.push('/aguardando')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-center items-center px-4 py-10 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="card w-full max-w-md shadow-2xl animate-fade-in p-6 sm:p-8">
        
        {/* Header do Cadastro */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo size="xl" priority className="mb-1" />
          <h1 className="nkfs-h-m text-main mt-3 text-center">Cadastro de Aluno</h1>
          <p className="nkfs-p-m text-muted mt-1 text-center">Núcleo de Kung Fu Shaolin</p>
        </div>

        {/* Step Indicator com classes DS */}
        <div className="step-bar mb-6">
          {[1, 2, 3].map(s => {
            let statusClass = ''
            if (s === step) statusClass = 'active'
            else if (s < step) statusClass = 'done'
            return <div key={s} className={`step-dot ${statusClass}`} />
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── STEP 1: Dados Pessoais ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="nkfs-tag-m text-gold block">
                Passo 1 — Dados Pessoais
              </span>
              
              <div className="field">
                <label className="label nkfs-tag-p text-muted">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="input"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="field">
                <label className="label nkfs-tag-p text-muted">
                  Data de nascimento *
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div className="field">
                <label className="label nkfs-tag-p text-muted">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="field">
                <label className="label nkfs-tag-p text-muted">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main focus:outline-none p-1 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!fullName || !birthDate || !email || !password) {
                    setError('Preencha todos os campos para continuar.')
                    return
                  }
                  setError(null)
                  setStep(2)
                }}
                className="btn btn-primary btn-full btn-lg mt-2"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── STEP 2: Modalidades & Graduação ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <span className="nkfs-tag-m text-gold block">
                Passo 2 — Modalidades Praticadas
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {MODALITIES.map(m => {
                  const isSelected = selectedModalities.includes(m.slug)
                  return (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => toggleModality(m.slug)}
                      className={`p-3.5 rounded-[var(--radius-lg)] border text-left transition-all ${
                        isSelected
                          ? 'card-gold border-[var(--color-border-gold)] text-main shadow-gold'
                          : 'card-elevated text-muted hover:border-[var(--color-border)]'
                      }`}
                    >
                      <div className={`nkfs-tag-g ${isSelected ? 'text-gold' : 'text-main'}`}>
                        {m.short}
                      </div>
                      <div className="nkfs-p-p mt-0.5 opacity-90">{m.label}</div>
                    </button>
                  )
                })}
              </div>

              {/* Campos de Graduação Dinâmicos */}
              {selectedModalities.length > 0 && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="alert alert-warning">
                    <p className="nkfs-p-p leading-relaxed">
                      ⓘ As graduações informadas passarão por análise e homologação prévia do Sifu Guilherme antes da liberação do conteúdo técnico.
                    </p>
                  </div>

                  {selectedModalities.map(slug => {
                    const mod = MODALITIES.find(m => m.slug === slug)!
                    return (
                      <div key={slug} className="field">
                        <label className="label nkfs-tag-p text-muted">
                          Graduação — {mod.label} *
                        </label>
                        <select
                          value={selfReported[slug] ?? ''}
                          onChange={e => setSelfReported(prev => ({ ...prev, [slug]: e.target.value }))}
                          className="select"
                        >
                          <option value="">Selecione sua faixa</option>
                          {GRADUATIONS_BY_MODALITY[slug].map(g => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline flex-1"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedModalities.length === 0) {
                      setError('Selecione ao menos uma modalidade.')
                      return
                    }
                    setError(null)
                    setStep(3)
                  }}
                  className="btn btn-primary flex-1"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Termos ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <span className="nkfs-tag-m text-gold block">
                Passo 3 — Termos e Declarações
              </span>

              <div className="flex flex-col gap-3">
                {[
                  { state: terms, set: setTerms, label: 'Li e concordo com os Termos de Uso e Regulamento Interno' },
                  { state: imageRights, set: setImageRights, label: 'Autorizo o uso de imagem e voz para fins institucionais da escola' },
                  { state: health, set: setHealth, label: 'Declaro aptidão física para a prática de artes marciais de alto impacto' },
                ].map(({ state, set, label }, idx) => (
                  <label
                    key={idx}
                    onClick={() => set(!state)}
                    className="card-elevated p-3 flex items-start gap-3 cursor-pointer hover:border-[var(--color-primary)] transition-all"
                  >
                    <div className={`checkbox-box ${state ? 'checked' : ''}`}>
                      {state && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="checkbox-label nkfs-p-p select-none">
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-outline flex-1"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-gold flex-1"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    'Enviar Cadastro'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Exibição centralizada de erros */}
          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠</span>
              <span className="nkfs-p-p">{error}</span>
            </div>
          )}
        </form>

        <p className="text-center nkfs-p-m text-muted mt-6">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-gold font-semibold hover:underline">
            Fazer Login
          </Link>
        </p>

        <div className="text-center mt-3">
          <Link href="/" className="nkfs-tag-p text-faint hover:text-muted transition-colors">
            ← Voltar para a página inicial
          </Link>
        </div>

      </div>
    </div>
  )
}