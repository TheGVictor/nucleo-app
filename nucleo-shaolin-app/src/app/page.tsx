'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const WHATSAPP_NUMBER = '551123862729'
const WHATSAPP_DISPLAY = '(11) 2386-2729'
const SCHOOL_ADDRESS = 'Av. Conselheiro Carrão, 2737'
const SCHOOL_NEIGHBORHOOD = 'Vila Carrão · São Paulo - SP'
const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Av.+Conselheiro+Carrao,+2737+-+Vila+Carrao,+Sao+Paulo+-+SP'

function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

interface ModalitySplit {
  id: string
  name: string
  subtitle: string
  image: string
  imageAlt: string
  desc: string
  highlights: string[]
  reverse: boolean
}

const MODALITIES_SECTIONS: ModalitySplit[] = [
  {
    id: 'clf',
    name: 'Kung Fu Choy Lay Fut',
    subtitle: 'Sistema Tradicional do Norte e Sul da China',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Praticante de Kung Fu Choy Lay Fut em postura tradicional',
    desc: 'Une o deslocamento ágil e os chutes do Norte com a potência de braços e bases firmes do Sul. O currículo abrange formas clássicas (Katis), defesa pessoal, calejamento e armas tradicionais.',
    highlights: [
      'Bases tradicionais, deslocamentos e potência de quadril',
      'Formas clássicas de mãos livres e armas (bastão, sabre e lança)',
      'Progressão técnica estruturada por graduação',
    ],
    reverse: false,
  },
  {
    id: 'tonlong',
    name: 'Ton Long Kung Fu',
    subtitle: 'Estilo Louva-a-Deus Tradicional',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Treinamento técnico de Ton Long Kung Fu',
    desc: 'Reconhecido pela velocidade de mãos, capturas rápidas, bloqueios angulares e contra-ataques imediatos em curta distância, desenvolvendo reflexos apurados e precisão técnica.',
    highlights: [
      'Técnicas de gancho, captura e controle articular',
      'Katis tradicionais do sistema Ton Long e aplicações em dupla',
      'Velocidade de reação e coordenação motora fina',
    ],
    reverse: true,
  },
  {
    id: 'taichi',
    name: 'Tai Chi Chuan',
    subtitle: 'Estilo Yang Tradicional & Chi Kung',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Prática de Tai Chi Chuan',
    desc: 'Arte marcial interna voltada ao equilíbrio postural, coordenação respiratória e fortalecimento sem impacto articular, trabalhando sequências tradicionais, Chi Kung, espada reta e leque.',
    highlights: [
      'Sequências tradicionais do estilo Yang e Espada Reta',
      'Fortalecimento, estabilidade e consciência respiratória',
      'Indicado para jovens, adultos e idosos',
    ],
    reverse: false,
  },
  {
    id: 'sanda',
    name: 'Sanda · Boxe Chinês',
    subtitle: 'Combate Esportivo & Defesa Pessoal',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Treinamento de Sanda Boxe Chinês',
    desc: 'Modalidade de combate do Kung Fu que integra boxe, chutes e projeções de queda. Treinos com alto condicionamento físico e prática segura com equipamentos de proteção.',
    highlights: [
      'Combinações de punho, chute e entradas de queda',
      'Condicionamento cardiorrespiratório e explosão muscular',
      'Prática supervisionada em ambiente controlado',
    ],
    reverse: true,
  },
]

const KIDS_BENEFITS = [
  {
    title: 'Foco e Disciplina',
    desc: 'Desenvolve atenção, paciência e escuta ativa com reflexo direto na escola e em casa.',
  },
  {
    title: 'Coordenação e Postura',
    desc: 'Equilíbrio, lateralidade e consciência corporal longe do excesso de telas.',
  },
  {
    title: 'Respeito (Mo Duk)',
    desc: 'Valorização do respeito aos pais, professores e colegas através da ética marcial.',
  },
  {
    title: 'Autoconfiança',
    desc: 'Segurança emocional, postura firme e autocontrole em ambiente acolhedor.',
  },
]

const FAQS = [
  {
    q: 'Preciso ter experiência prévia para começar?',
    a: 'Não. As turmas iniciantes respeitam o ritmo individual de cada pessoa, construindo base, mobilidade e condicionamento de forma gradual.',
  },
  {
    q: 'A partir de qual idade as crianças podem treinar no Kung Fu Kids?',
    a: 'Recebemos crianças a partir dos 5 anos nas turmas infantis (Siu Lung / Kung Fu Kids), com metodologia adaptada para a faixa etária.',
  },
  {
    q: 'Onde fica a escola e como agendar uma aula experimental?',
    a: 'Estamos na Av. Conselheiro Carrão, 2737 (Vila Carrão, São Paulo). Basta clicar no botão do WhatsApp para falar com nossa recepção pelo número (11) 2386-2729.',
  },
  {
    q: 'Posso praticar mais de uma modalidade?',
    a: 'Sim. Você pode combinar Kung Fu (Choy Lay Fut e Ton Long) com Sanda ou Tai Chi Chuan conforme sua disponibilidade de horários.',
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
      {/* ── HEADER LIMPO (SEM ATALHOS INTERNOS) ─────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg)]/85 backdrop-blur-xl border-b border-[var(--color-border)] pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="sm" priority className="shrink-0" />
            <span className="font-bold text-[var(--color-text)] tracking-tight text-sm sm:text-base truncate">
              Núcleo de Kung Fu Shaolin
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />
            <a
              href={getWhatsAppUrl(
                'Olá! Gostaria de agendar uma aula experimental no Núcleo de Kung Fu Shaolin.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold btn-sm font-bold text-xs sm:text-sm px-4 py-2 shrink-0"
            >
              Agendar Aula
            </a>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────────────────────── */}
      <main id="main-content" className="flex-1 flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />

        {/* ── HERO SECTION: LIMPA, MODERNA E DIRETA ────────────────── */}
        <section className="py-12 sm:py-20 lg:py-24 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">
                  Sifu Guilherme · {SCHOOL_ADDRESS}
                </span>

                <h1 className="text-[var(--color-text)] font-extrabold tracking-tight text-3xl sm:text-5xl leading-[1.12]">
                  Tradição autêntica nas{' '}
                  <span className="text-gold">Artes Marciais Chinesas.</span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-muted max-w-xl leading-relaxed">
                  Ensino presencial de <strong className="text-main">Kung Fu Choy Lay Fut</strong>,{' '}
                  <strong className="text-main">Ton Long</strong>,{' '}
                  <strong className="text-main">Kung Fu Kids</strong>,{' '}
                  <strong className="text-main">Tai Chi Chuan</strong> e{' '}
                  <strong className="text-main">Sanda (Boxe Chinês)</strong> na Vila Carrão, em São Paulo.
                </p>

                <div className="mt-8">
                  <a
                    href={getWhatsAppUrl(
                      'Olá! Gostaria de agendar uma aula experimental no Núcleo de Kung Fu Shaolin.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-lg font-bold px-7 py-3.5 shadow-sm inline-flex items-center gap-2"
                  >
                    <span>Agendar Aula Experimental</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl aspect-[4/3] lg:aspect-[5/6] bg-[var(--color-bg-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1000"
                    alt="Treinamento tradicional no Núcleo de Kung Fu Shaolin"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MODALIDADES (CHOY LAY FUT, TON LONG, TAI CHI, SANDA) ──── */}
        <section className="py-16 sm:py-24 flex flex-col gap-16 sm:gap-24 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Modalidades
            </span>
            <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-1 tracking-tight">
              Sistemas Marciais da Escola
            </h2>
          </div>

          {MODALITIES_SECTIONS.map((section) => (
            <div key={section.id} className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                <div
                  className={`lg:col-span-6 ${
                    section.reverse ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)] aspect-[16/10]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={section.image}
                      alt={section.imageAlt}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div
                  className={`lg:col-span-6 flex flex-col items-start ${
                    section.reverse ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-gold">
                    {section.subtitle}
                  </span>

                  <h3 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl mt-1 tracking-tight">
                    {section.name}
                  </h3>

                  <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
                    {section.desc}
                  </p>

                  <ul className="space-y-2 mt-5">
                    {section.highlights.map((h, hIdx) => (
                      <li
                        key={hIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--color-text)]"
                      >
                        <span className="text-gold font-bold shrink-0">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── SEÇÃO KUNG FU KIDS (INFANTIL) ─────────────────────────── */}
        <section className="py-16 sm:py-24 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7 flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  Turmas Infantis · A partir dos 5 anos
                </span>

                <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-1.5 tracking-tight">
                  Kung Fu Kids
                </h2>

                <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed max-w-xl">
                  Aulas planejadas para o desenvolvimento físico e emocional infantil, unindo coordenação motora, concentração e ética marcial (<em>Mo Duk</em>).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7 w-full">
                  {KIDS_BENEFITS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
                    >
                      <h3 className="text-sm font-bold text-main">{item.title}</h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <a
                    href={getWhatsAppUrl(
                      'Olá! Gostaria de informações sobre o Kung Fu Kids.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-md font-bold px-6 py-3"
                  >
                    Agendar Aula Kids
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] aspect-[4/3] bg-[var(--color-bg-card)] shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=900"
                    alt="Aulas de Kung Fu Kids"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DÚVIDAS FREQUENTES (FAQ) ────────────────────────────── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Dúvidas
              </span>
              <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl mt-1">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, index) => {
                const isOpen = expandedFaqIndex === index
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-[var(--color-text)] hover:text-gold transition-colors cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold">{faq.q}</span>
                      <span className="text-gold font-bold text-xl shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-muted text-sm leading-relaxed border-t border-[var(--color-border)] pt-3.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SEÇÃO FINAL: ÁREA EXCLUSIVA PARA NOSSOS ALUNOS (APENAS ACESSAR) ── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-[var(--color-border-gold)]/40 bg-[var(--color-bg-card)] p-8 sm:p-10 text-center flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Portal do Aluno
              </span>

              <h2 className="text-[var(--color-text)] font-extrabold text-xl sm:text-2xl mt-2">
                Área Exclusiva para Alunos
              </h2>

              <p className="text-sm text-muted mt-2 max-w-md leading-relaxed">
                Acesso restrito aos alunos matriculados para consulta de ficha técnica, grade de horários e vídeos de treinamento.
              </p>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="btn btn-gold btn-md font-bold px-7 py-3"
                >
                  Acessar Área do Aluno
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER MODERNO E LIMPO (SEM ATALHOS PARA O PRÓPRIO SITE) ── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] text-muted py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <span className="font-bold text-[var(--color-text)] text-sm sm:text-base block">
                  Núcleo de Kung Fu Shaolin
                </span>
                <span className="text-xs text-muted">
                  Coordenação Técnica · Sifu Guilherme
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-xs sm:text-sm">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                <strong className="text-main">{SCHOOL_ADDRESS}</strong> · {SCHOOL_NEIGHBORHOOD}
              </a>

              <a
                href={getWhatsAppUrl('Olá! Vim pelo site do Núcleo de Kung Fu Shaolin.')}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors font-semibold text-main"
              >
                WhatsApp: {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-faint">
            <span>
              © 2026 Núcleo de Kung Fu Shaolin. Todos os direitos reservados.
            </span>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/nucleokungfushaolin/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-main transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/nucleokungfushaolin/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-main transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── BOTÃO FLUTUANTE DO WHATSAPP (APENAS O BOTÃO, SEM CHAT ABERTO) ── */}
      <a
        href={getWhatsAppUrl('Olá! Vim pelo site do Núcleo de Kung Fu Shaolin e gostaria de informações.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        title={`WhatsApp ${WHATSAPP_DISPLAY}`}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:scale-105 transition-all flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.126.556 4.124 1.535 5.86l-1.535 5.605 5.736-1.504c1.693.913 3.631 1.439 5.694 1.439 6.627 0 12-5.373 12-12s-5.373-12-11.43-11.4z" />
        </svg>
      </a>
    </div>
  )
}
