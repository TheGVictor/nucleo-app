'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface ModalityCard {
  id: string
  name: string
  subtitle: string
  icon: string
  tag: string
  desc: string
  highlights: string[]
}

const MODALITIES: ModalityCard[] = [
  {
    id: 'clf',
    name: 'Kung Fu Shaolin',
    subtitle: 'Choy Lay Fut Tradicional',
    icon: '🥋',
    tag: 'Tradição & Força',
    desc: 'Sistema marcial dinâmico e tradicional do Norte e Sul da China. Desenvolve condicionamento físico integral, agilidade, formas clássicas (Katis) e armas tradicionais chinesas.',
    highlights: ['Defesa pessoal prática e instintiva', 'Bastão, sabre, lança e armas clássicas', 'Aulas para crianças, jovens e adultos'],
  },
  {
    id: 'taichi',
    name: 'Tai Chi Chuan',
    subtitle: 'Estilo Yang & Qi Gong',
    icon: '☯️',
    tag: 'Saúde & Longevidade',
    desc: 'Meditação em movimento com sequências suaves, respiração consciente e cultivo da energia vital. Promove alívio de estresse, flexibilidade e equilíbrio corporal para todas as idades.',
    highlights: ['Correção postural e saúde articular', 'Redução comprovada de estresse e ansiedade', 'Exercícios terapêuticos de Chi Kung'],
  },
  {
    id: 'sanda',
    name: 'Sanda / Boxe Chinês',
    subtitle: 'Combate Marcial Esportivo',
    icon: '🥊',
    tag: 'Alto Rendimento',
    desc: 'O combate moderno chinês que combina socos, chutes e projeções de quedas. Treino dinâmico focado em alto gasto calórico, resistência cardiovascular e autodefesa em ambiente seguro.',
    highlights: ['Condicionamento cardiovascular intenso', 'Técnicas de quedas, esquivas e projeções', 'Prática orientada e com total segurança'],
  },
]

const PILLARS = [
  {
    icon: '🏯',
    title: 'Linhagem Autêntica',
    desc: 'Ensino tradicional sob a orientação técnica do Sifu Guilherme, preservando métodos clássicos com rigor e precisão biomecânica.',
  },
  {
    icon: '🤝',
    title: 'Ambiente Respeitoso e Familiar',
    desc: 'Um Kwoon (dojô) acolhedor onde cultivamos a disciplina, o respeito mútuo e a fraternidade, sem arrogância ou agressividade.',
  },
  {
    icon: '📱',
    title: 'Portal do Aluno Exclusivo',
    desc: 'Acesso digital direto à sua ficha técnica oficial, avaliações do Sifu, vídeos dos Katis para treinar em casa e mural de avisos.',
  },
]

const FAQS = [
  {
    q: 'Nunca fiz artes marciais e não tenho flexibilidade. Posso começar?',
    a: 'Com certeza! Flexibilidade, força e coordenação são desenvolvidas progressivamente durante os treinos. Nossos instrutores adaptam cada exercício ao seu ritmo e condição física.',
  },
  {
    q: 'Qual é a idade recomendada para iniciar os treinos?',
    a: 'Recebemos alunos a partir dos 5 anos em turmas infantis com metodologia lúdica e acolhedora, além de jovens, adultos e idosos no Kung Fu e Tai Chi Chuan.',
  },
  {
    q: 'Como funciona a aula experimental?',
    a: 'A aula experimental é gratuita e sem qualquer compromisso. Você conhece o dojô, conversa com o Sifu e vivencia os primeiros fundamentos na prática. Basta vir com roupa confortável de treino.',
  },
  {
    q: 'O que é o Portal do Aluno do Núcleo Shaolin?',
    a: 'É a plataforma online oficial da nossa escola. Nela você acompanha seu histórico de faixas, presenças em aula, avisos oficiais e tem acesso a vídeos técnicos dos Katis homologados para sua graduação.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://nucleo-app-iota.vercel.app/#faq',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
}

export default function HomePage() {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between selection:bg-[var(--color-primary)] selection:text-white">
      {/* ── HEADER MINIMALISTA & LIMPO (SEM MENU POLUÍDO) ──────── */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-card)]/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Marca */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <Logo size="sm" priority className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-extrabold text-[var(--color-text)] tracking-tight text-sm sm:text-base leading-none">
                Núcleo Shaolin
              </span>
              <span className="nkfs-tag-p text-gold mt-0.5 tracking-wider font-semibold">
                Kung Fu Tradicional
              </span>
            </div>
          </Link>

          {/* Ações Rápidas Direitas */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="btn btn-outline btn-sm font-medium text-xs sm:text-sm px-3 sm:px-4"
            >
              Área do Aluno
            </Link>

            <Link
              href="/cadastro"
              className="btn btn-gold btn-sm font-semibold shadow-sm text-xs sm:text-sm px-3.5 sm:px-4"
            >
              Matrícula
            </Link>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL SEMÂNTICO (MAIN) ──────────────────── */}
      <main id="main-content" className="flex-1 flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />

        {/* ── HERO SECTION ENXUTA & ELEGANTE ─────────────────────── */}
        <section className="relative overflow-hidden py-14 sm:py-20 border-b border-[var(--color-border)]">
        {/* Glow decorativo sutil de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[var(--color-primary)] opacity-8 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[280px] h-[280px] bg-[var(--color-gold)] opacity-10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative flex flex-col items-center text-center">
          {/* Logo Oficial Centralizada */}
          <div className="mb-5">
            <Logo size="2xl" priority className="shadow-xl hover:scale-105 transition-transform duration-300" />
          </div>

          <Badge variant="gold">
            ⛩️ Tradição Milenar & Linhagem Oficial
          </Badge>

          <h1 className="nkfs-h-g text-[var(--color-text)] font-extrabold tracking-tight mt-4 text-3xl sm:text-4xl md:text-5xl leading-[1.18]">
            Núcleo de Kung Fu Shaolin
          </h1>

          <p className="mt-2 text-base sm:text-xl font-semibold text-gold max-w-xl">
            Corpo forte, mente disciplinada e espírito inabalável.
          </p>

          <p className="nkfs-p-m text-muted mt-3 max-w-2xl leading-relaxed">
            Preservamos a essência do Kung Fu tradicional chinês, Tai Chi Chuan e Sanda sob a supervisão do Sifu Guilherme. Treinamento completo para crianças, jovens e adultos, aliado a um portal de acompanhamento digital exclusivo.
          </p>

          {/* Botões de Ação Principais */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-7 w-full max-w-md">
            <Link
              href="/cadastro"
              className="btn btn-gold btn-lg btn-full sm:flex-1 shadow-md font-semibold text-center"
            >
              🥋 Solicitar Matrícula
            </Link>
            <Link
              href="/login"
              className="btn btn-outline btn-lg btn-full sm:flex-1 font-medium text-center"
            >
              Área do Aluno
            </Link>
          </div>

          {/* Destaques Rápidos / Prova Social (Faixa Clean) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-10 pt-6 border-t border-[var(--color-border)] w-full max-w-2xl">
            <div className="flex flex-col items-center text-center">
              <span className="text-xl sm:text-2xl font-bold text-gold">20+</span>
              <span className="nkfs-tag-p text-muted mt-0.5">Anos de Tradição</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-xl sm:text-2xl font-bold text-primary">5 a 70+</span>
              <span className="nkfs-tag-p text-muted mt-0.5">Todas as Idades</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-xl sm:text-2xl font-bold text-success">100%</span>
              <span className="nkfs-tag-p text-muted mt-0.5">Portal do Aluno</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODALIDADES DA ESCOLA (3 CARDS OBJETIVOS) ──────────── */}
      <section className="py-14 sm:py-18 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="primary">Currículo Oficial</Badge>
            <h2 className="nkfs-h-m text-[var(--color-text)] font-bold text-2xl sm:text-3xl mt-2">
              Modalidades da Escola
            </h2>
            <p className="nkfs-p-m text-muted mt-1.5">
              Escolha a prática marcial que melhor atende aos seus objetivos de saúde, defesa pessoal ou condicionamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MODALITIES.map((m) => (
              <div
                key={m.id}
                className="card p-6 flex flex-col justify-between hover:border-[var(--color-gold)] transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{m.icon}</span>
                    <Badge variant={m.id === 'clf' ? 'gold' : m.id === 'taichi' ? 'primary' : 'warning'}>
                      {m.tag}
                    </Badge>
                  </div>

                  <h3 className="nkfs-h-p text-[var(--color-text)] font-bold mb-0.5">
                    {m.name}
                  </h3>
                  <span className="nkfs-tag-p text-gold font-medium block mb-3">
                    {m.subtitle}
                  </span>

                  <p className="nkfs-p-m text-muted leading-relaxed mb-4">
                    {m.desc}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[var(--color-border)]">
                    {m.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-text)]">
                        <span className="text-gold font-bold">✓</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                  <Link
                    href="/cadastro"
                    className="nkfs-tag-p text-gold hover:underline font-bold flex items-center justify-between"
                  >
                    <span>Experimentar {m.name}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS: TRADIÇÃO & PORTAL DO ALUNO ───────────── */}
      <section className="py-14 sm:py-18 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="gold">Por que o Núcleo Shaolin?</Badge>
            <h2 className="nkfs-h-m text-[var(--color-text)] font-bold text-2xl sm:text-3xl mt-2">
              Tradição Marcial e Tecnologia Exclusiva
            </h2>
            <p className="nkfs-p-m text-muted mt-1.5">
              Muito além de uma academia: um espaço de disciplina, fraternidade e acompanhamento técnico contínuo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PILLARS.map((p, idx) => (
              <div
                key={idx}
                className="card-elevated p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold-muted)] border border-[var(--color-border-gold)] text-gold flex items-center justify-center text-2xl">
                  {p.icon}
                </div>
                <h3 className="nkfs-h-p text-[var(--color-text)] font-bold mt-1">
                  {p.title}
                </h3>
                <p className="nkfs-p-m text-muted leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DÚVIDAS FREQUENTES (FAQ ENXUTO) ────────────────────── */}
      <section className="py-14 sm:py-18 border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <Badge variant="primary">Tire Suas Dúvidas</Badge>
            <h2 className="nkfs-h-m text-[var(--color-text)] font-bold text-2xl sm:text-3xl mt-2">
              Perguntas Frequentes
            </h2>
            <p className="nkfs-p-m text-muted mt-1.5">
              Informações rápidas antes de iniciar seus treinos.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {FAQS.map((faq, index) => {
              const isOpen = expandedFaqIndex === index
              return (
                <div
                  key={index}
                  className="card-elevated overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-4 font-semibold text-[var(--color-text)] hover:text-gold transition-colors"
                  >
                    <span className="nkfs-p-m font-bold">{faq.q}</span>
                    <span className="text-gold font-bold text-lg shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-4.5 pb-4 sm:pb-4.5 text-muted nkfs-p-m leading-relaxed border-t border-[var(--color-border)] pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BANNER CTA FINAL LIMPO ──────────────────────────────── */}
      <section className="py-14 sm:py-18">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="card-gold p-8 sm:p-12 text-center flex flex-col items-center relative overflow-hidden shadow-xl">
            <div className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-gold)] flex items-center justify-center text-2xl mb-3 shadow-md">
              🥋
            </div>

            <Badge variant="gold">Venha Treinar Conosco</Badge>

            <h2 className="nkfs-h-g text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl mt-3 max-w-lg">
              Pronto para iniciar sua jornada no Kung Fu?
            </h2>

            <p className="nkfs-p-m text-muted mt-2 max-w-md">
              Agende sua aula experimental gratuita ou envie seu cadastro pelo portal para avaliação do Sifu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-sm">
              <Link
                href="/cadastro"
                className="btn btn-gold btn-lg btn-full shadow-md font-semibold text-center"
              >
                Solicitar Matrícula
              </Link>
              <Link
                href="/login"
                className="btn btn-outline btn-lg btn-full font-medium text-center"
              >
                Área do Aluno
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* ── FOOTER MINIMALISTA & RESPONSIVO ─────────────────────── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] py-8 text-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <div className="flex flex-col">
              <span className="font-bold text-[var(--color-text)] text-sm leading-tight">
                Núcleo de Kung Fu Shaolin
              </span>
              <span className="nkfs-tag-p text-faint">
                Supervisão Técnica · Sifu Guilherme
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link href="/cadastro" className="hover:text-gold transition-colors font-medium">
              Matrícula
            </Link>
            <span className="text-faint">·</span>
            <Link href="/login" className="hover:text-gold transition-colors font-medium">
              Área do Aluno
            </Link>
            <span className="text-faint">·</span>
            <span className="nkfs-tag-p text-faint">© 2026 Todos os direitos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
