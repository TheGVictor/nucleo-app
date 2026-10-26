'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface ModalitySplit {
  id: string
  name: string
  subtitle: string
  tag: string
  tagVariant: 'gold' | 'primary' | 'warning'
  image: string
  imageAlt: string
  badgeOnImage: string
  desc: string
  highlights: string[]
  ctaText: string
  reverse: boolean
}

const SPLIT_SECTIONS: ModalitySplit[] = [
  {
    id: 'clf',
    name: 'Kung Fu Shaolin',
    subtitle: 'Choy Lay Fut Tradicional (蔡李佛)',
    tag: 'Tradição & Força',
    tagVariant: 'gold',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Praticante de Kung Fu executando postura tradicional com foco e disciplina',
    badgeOnImage: '⛩️ Linhagem Oficial · Fundado em 1836',
    desc: 'O Choy Lay Fut é um dos sistemas de Kung Fu mais completos e respeitados do mundo. Ele funde a agilidade das técnicas de pernas e posturas baixas do Norte com a força explosiva dos punhos do Sul da China, proporcionando um treinamento marcial vigoroso e completo.',
    highlights: [
      'Formas clássicas tradicionais (Katis) e manejo de armas: bastão, sabre e lança',
      'Defesa pessoal instintiva, reflexos rápidos e consciência corporal plena',
      'Metodologia adaptada: turmas Kids (5 a 11 anos), Jovens e Adultos',
    ],
    ctaText: 'Experimentar Kung Fu Shaolin',
    reverse: false,
  },
  {
    id: 'taichi',
    name: 'Tai Chi Chuan',
    subtitle: 'Estilo Yang Tradicional & Chi Kung (氣功)',
    tag: 'Saúde & Longevidade',
    tagVariant: 'primary',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Praticante de Tai Chi Chuan em postura de concentração e equilíbrio',
    badgeOnImage: '☯️ Harmonia, Respiração & Qi Gong',
    desc: 'Conhecido como meditação em movimento, o Tai Chi Chuan combina movimentos suaves, contínuos e harmônicos com técnicas profundas de respiração e concentração mental. Restabelece o fluxo de energia vital (Qi) e equilibra o sistema nervoso.',
    highlights: [
      'Correção postural biomecânica e fortalecimento articular suave sem impacto',
      'Redução comprovada de estresse, melhora na qualidade do sono e ansiedade',
      'Prática terapêutica acessível e altamente recomendada para todas as idades',
    ],
    ctaText: 'Praticar Tai Chi Chuan',
    reverse: true,
  },
  {
    id: 'sanda',
    name: 'Sanda / Boxe Chinês',
    subtitle: 'Combate Marcial Esportivo Completo',
    tag: 'Alto Rendimento',
    tagVariant: 'warning',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Atleta com luvas de combate em treinamento de alta intensidade',
    badgeOnImage: '🥊 Combate Moderno & Autodefesa Real',
    desc: 'O Sanda representa a faceta de combate esportivo e dinâmico das artes marciais chinesas. Integra socos velozes, chutes potentes e projeções espetaculares de quedas, tudo conduzido com equipamentos de segurança homologados e supervisão rigorosa.',
    highlights: [
      'Condicionamento físico cardiovascular extremo e elevado gasto calórico',
      'Domínio técnico de projeções, chutes na média distância e defesas sólidas',
      'Treinamento progressivo com respeito absoluto à integridade física do colega',
    ],
    ctaText: 'Conhecer o Sanda',
    reverse: false,
  },
  {
    id: 'kwoon',
    name: 'Nosso Kwoon & Filosofia',
    subtitle: 'Mo Duk (武德) — A Nobre Ética Marcial',
    tag: 'Comunidade & Família',
    tagVariant: 'gold',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Ambiente do Dojô com praticantes em harmonia e respeito mútuo',
    badgeOnImage: '🏯 Kwoon Tradicional · Dojô Acolhedor',
    desc: 'No Núcleo de Kung Fu Shaolin, a arte marcial vai muito além dos golpes: é uma ferramenta de desenvolvimento moral, respeito aos mestres e amor à família. Um ambiente seguro, sem arrogância e com tecnologia de ponta para acompanhar o aprendizado de cada aluno.',
    highlights: [
      'Orientação técnica direta sob a linhagem do Sifu Guilherme',
      'Portal Digital Exclusivo com vídeos técnicos oficiais dos Katis de cada faixa',
      'Loja integrada para uniformes, camisetas, faixas e equipamentos oficiais',
    ],
    ctaText: 'Conhecer Nossa Escola',
    reverse: true,
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
    title: 'Ambiente Familiar e Seguro',
    desc: 'Um Kwoon (dojô) acolhedor onde cultivamos a disciplina, o respeito mútuo e a fraternidade, sem arrogância ou agressividade.',
  },
  {
    icon: '📱',
    title: 'Portal do Aluno Exclusivo',
    desc: 'Acesso digital direto à sua ficha técnica oficial, avaliações do Sifu, vídeos dos Katis para treinar em casa e mural de avisos.',
  },
  {
    icon: '🛍️',
    title: 'Loja Oficial Integrada',
    desc: 'Facilidade para reservar uniformes, faixas, armas tradicionais e acessórios direto pelo celular com pagamento na recepção ou PIX.',
  },
]

const FAQS = [
  {
    q: 'Nunca fiz artes marciais e não tenho flexibilidade. Posso começar?',
    a: 'Com certeza! Flexibilidade, força e coordenação são desenvolvidas progressivamente durante os treinos. Nossos instrutores adaptam cada exercício ao seu ritmo e condição física individual.',
  },
  {
    q: 'Qual é a idade recomendada para iniciar os treinos?',
    a: 'Recebemos alunos a partir dos 5 anos em turmas infantis com metodologia lúdica e acolhedora, além de turmas juvenis, adultos e melhor idade no Kung Fu, Tai Chi Chuan e Sanda.',
  },
  {
    q: 'Como funciona a aula experimental?',
    a: 'A aula experimental é gratuita e sem qualquer compromisso. Você conhece o Kwoon, conversa com os instrutores e vivencia os primeiros fundamentos na prática. Basta vir com roupa confortável de treino.',
  },
  {
    q: 'O que é o Portal do Aluno do Núcleo Shaolin?',
    a: 'É a plataforma online oficial da nossa escola. Nela você acompanha seu histórico de faixas, presenças em aula, avisos oficiais, loja e tem acesso a vídeos técnicos dos Katis homologados para sua graduação.',
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
      {/* ── HEADER MINIMALISTA & LIMPO (MANTIDO CONFORME ESTRUTURA ORIGINAL) ── */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-card)]/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm transition-all pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap min-w-0">
          {/* Logo & Marca */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <Logo size="sm" priority className="group-hover:scale-105 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[var(--color-text)] tracking-tight text-sm sm:text-base leading-none truncate">
                Núcleo Shaolin
              </span>
              <span className="nkfs-tag-p text-gold mt-0.5 tracking-wider font-semibold hidden sm:block">
                Kung Fu Tradicional
              </span>
            </div>
          </Link>

          {/* Ações Rápidas Direitas */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
            <ThemeToggle />

            <Link
              href="/login"
              className="btn btn-outline btn-sm font-semibold text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 shrink-0"
            >
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Área do Aluno</span>
            </Link>

            <Link
              href="/cadastro"
              className="btn btn-gold btn-sm font-semibold shadow-sm text-xs sm:text-sm px-3 sm:px-4 py-1.5 shrink-0"
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

        {/* ── HERO SECTION EDITORIAL COM IMAGEM REAL & TEXTO DIVIDIDO ── */}
        <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20 border-b border-[var(--color-border)]">
          {/* Glows decorativos suaves de fundo */}
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[var(--color-primary)] opacity-10 blur-[130px] pointer-events-none rounded-full" />
          <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-[var(--color-gold)] opacity-10 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Coluna Texto (Hero Esquerda) */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  <Badge variant="gold">
                    ⛩️ Tradição Milenar & Linhagem Oficial
                  </Badge>
                  <span className="nkfs-tag-p text-gold hidden sm:inline-block">
                    Supervisão Sifu Guilherme
                  </span>
                </div>

                <h1 className="text-[var(--color-text)] font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                  A Força da Tradição.{' '}
                  <span className="text-gold block sm:inline">
                    O Poder da Disciplina.
                  </span>
                </h1>

                <p className="mt-3 text-base sm:text-lg font-medium text-[var(--color-text-secondary)] max-w-xl">
                  Kung Fu Shaolin Choy Lay Fut, Tai Chi Chuan Yang e Sanda. Transformação física, foco mental e espírito inabalável para todas as idades.
                </p>

                <p className="nkfs-p-m text-muted mt-2 max-w-xl leading-relaxed">
                  Aprenda sob a tutela de instrutores formados na linhagem tradicional, com estrutura completa de dojô e um portal online exclusivo para acompanhar sua evolução marcial.
                </p>

                {/* Botões de Ação Principais */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 w-full sm:w-auto">
                  <Link
                    href="/cadastro"
                    className="btn btn-gold btn-lg shadow-md font-bold text-center px-6 py-3"
                  >
                    🥋 Solicitar Matrícula
                  </Link>
                  <Link
                    href="/login"
                    className="btn btn-outline btn-lg font-semibold text-center px-6 py-3"
                  >
                    Área do Aluno
                  </Link>
                </div>

                {/* Métricas / Prova Social rápida */}
                <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 pt-6 border-t border-[var(--color-border)] w-full">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-gold">20+</span>
                    <span className="block nkfs-tag-p text-muted mt-0.5">Anos de Tradição</span>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-primary">5 a 70+</span>
                    <span className="block nkfs-tag-p text-muted mt-0.5">Todas as Idades</span>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-success">100%</span>
                    <span className="block nkfs-tag-p text-muted mt-0.5">Linhagem Homologada</span>
                  </div>
                </div>
              </div>

              {/* Coluna Imagem Real (Hero Direita) */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--color-border-gold)]/30 shadow-2xl bg-[var(--color-bg-card)] group aspect-[4/3] sm:aspect-[4/3] lg:aspect-[5/6]">
                  {/* Imagem Real de Alta Qualidade */}
                  <img
                    src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1000"
                    alt="Praticante em postura marcial clássica no Núcleo de Kung Fu Shaolin"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  {/* Gradiente de proteção para textos flutuantes */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Card Flutuante Inferior */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xl shrink-0">
                        🥋
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs uppercase tracking-wider font-bold text-amber-300 block">
                          Kwoon Oficial Núcleo Shaolin
                        </span>
                        <p className="text-sm font-medium text-gray-200 truncate">
                          Tradição, Disciplina e Ética Marcial Mo Duk
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badge Flutuante Superior */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Matrículas Abertas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── JOGO DE IMAGENS REAIS DIVIDIDAS COM TEXTOS (SPLIT SECTIONS) ── */}
        <section className="py-12 sm:py-20 flex flex-col gap-16 sm:gap-24 border-b border-[var(--color-border)]">
          {SPLIT_SECTIONS.map((section, index) => {
            return (
              <div
                key={section.id}
                className="max-w-6xl mx-auto px-4 sm:px-6 w-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                  {/* Imagem Real com Moldura e Efeito */}
                  <div
                    className={`lg:col-span-6 ${
                      section.reverse ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl bg-[var(--color-bg-card)] group aspect-[4/3] sm:aspect-[16/11]">
                      <img
                        src={section.image}
                        alt={section.imageAlt}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      {/* Gradiente sutil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                      {/* Badge sobre a imagem */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block bg-black/70 backdrop-blur-md border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                          {section.badgeOnImage}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloco de Texto Dividido */}
                  <div
                    className={`lg:col-span-6 flex flex-col items-start ${
                      section.reverse ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="mb-2">
                      <Badge variant={section.tagVariant}>{section.tag}</Badge>
                    </div>

                    <h2 className="nkfs-h-g text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
                      {section.name}
                    </h2>

                    <span className="text-gold font-semibold text-sm sm:text-base mt-1">
                      {section.subtitle}
                    </span>

                    <p className="nkfs-p-m text-muted mt-3.5 leading-relaxed">
                      {section.desc}
                    </p>

                    {/* Destaques Técnicos com Ícones */}
                    <div className="space-y-2.5 mt-5 w-full">
                      {section.highlights.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--color-text)]"
                        >
                          <span className="text-gold font-bold text-base leading-none shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA da Seção */}
                    <div className="mt-6 pt-4 border-t border-[var(--color-border)] w-full flex items-center justify-between">
                      <Link
                        href="/cadastro"
                        className="btn btn-outline btn-md font-semibold inline-flex items-center gap-2 group hover:border-[var(--color-gold)] hover:text-gold"
                      >
                        <span>{section.ctaText}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>

                      <span className="text-xs text-muted font-medium">
                        0{index + 1} / 0{SPLIT_SECTIONS.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* ── PILARES DE EXCELÊNCIA (POR QUE O NÚCLEO SHAOLIN) ───── */}
        <section className="py-14 sm:py-20 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="gold">Nossos Diferenciais</Badge>
              <h2 className="nkfs-h-m text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl mt-2.5">
                Tradição Marcial aliada à Tecnologia Moderna
              </h2>
              <p className="nkfs-p-m text-muted mt-2">
                Mais do que uma escola de artes marciais: uma estrutura completa focada na formação integral do aluno.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PILLARS.map((p, idx) => (
                <div
                  key={idx}
                  className="card-elevated p-6 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[var(--color-gold)] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-gold-muted)] border border-[var(--color-border-gold)] text-gold flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
                    {p.icon}
                  </div>
                  <h3 className="nkfs-h-p text-[var(--color-text)] font-bold mt-1">
                    {p.title}
                  </h3>
                  <p className="nkfs-p-m text-muted leading-relaxed text-sm">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DÚVIDAS FREQUENTES (FAQ) ────────────────────────────── */}
        <section className="py-14 sm:py-20 border-b border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <Badge variant="primary">Dúvidas Frequentes</Badge>
              <h2 className="nkfs-h-m text-[var(--color-text)] font-bold text-2xl sm:text-3xl mt-2.5">
                Perguntas Frequentes
              </h2>
              <p className="nkfs-p-m text-muted mt-2">
                Tudo o que você precisa saber para começar a treinar conosco.
              </p>
            </div>

            <div className="flex flex-col gap-3">
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
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-[var(--color-text)] hover:text-gold transition-colors"
                    >
                      <span className="nkfs-p-m font-bold">{faq.q}</span>
                      <span className="text-gold font-bold text-xl shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-muted nkfs-p-m leading-relaxed border-t border-[var(--color-border)] pt-3.5 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── BANNER CTA FINAL DE MATRÍCULA ───────────────────────── */}
        <section className="py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="card-gold p-8 sm:p-12 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-gold)] flex items-center justify-center text-2xl mb-3 shadow-md">
                🥋
              </div>

              <Badge variant="gold">Inicie Seus Treinos</Badge>

              <h2 className="nkfs-h-g text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl md:text-4xl mt-3 max-w-xl">
                Pronto para transformar sua mente e seu corpo?
              </h2>

              <p className="nkfs-p-m text-muted mt-2 max-w-lg">
                Agende uma aula experimental gratuita sem compromisso ou faça seu pré-cadastro direto pelo portal oficial.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
                <Link
                  href="/cadastro"
                  className="btn btn-gold btn-lg btn-full shadow-md font-bold text-center"
                >
                  🥋 Solicitar Matrícula
                </Link>
                <Link
                  href="/login"
                  className="btn btn-outline btn-lg btn-full font-semibold text-center"
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
