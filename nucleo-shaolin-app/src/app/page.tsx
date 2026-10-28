'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
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
  tag: string
  tagVariant: 'gold' | 'primary' | 'warning'
  image: string
  imageAlt: string
  badgeOnImage: string
  desc: string
  highlights: string[]
  ctaText: string
  whatsappMessage: string
  reverse: boolean
}

const MODALITIES_SECTIONS: ModalitySplit[] = [
  {
    id: 'clf',
    name: 'Kung Fu Choy Lay Fut',
    subtitle: 'Sistema Clássico do Norte e Sul da China (蔡李佛)',
    tag: 'Linhagem Tradicional',
    tagVariant: 'gold',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Praticante de Kung Fu Choy Lay Fut em postura tradicional',
    badgeOnImage: '⛩️ Fundado em 1836 · Linhagem Oficial',
    desc: 'O Choy Lay Fut une o deslocamento ágil e os chutes do Norte da China com a potência de braços e bases firmes do Sul. O currículo trabalha formas tradicionais (Katis), aplicações reais de defesa pessoal, calejamento progressivo e armas clássicas.',
    highlights: [
      'Bases sólidas (Sei Ping Ma, Ding Ji Ma), deslocamentos e potência de quadril',
      'Formas clássicas de mãos livres e armas tradicionais: bastão, sabre e lança',
      'Treinamento técnico estruturado por graduação para jovens e adultos',
    ],
    ctaText: 'Agendar Aula de Choy Lay Fut',
    whatsappMessage: 'Olá! Gostaria de agendar uma aula experimental de Kung Fu Choy Lay Fut na Av. Conselheiro Carrão, 2737.',
    reverse: false,
  },
  {
    id: 'tonlong',
    name: 'Ton Long Kung Fu',
    subtitle: 'Estilo Louva-a-Deus Tradicional (螳螂拳)',
    tag: 'Velocidade & Precisão',
    tagVariant: 'gold',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Treinamento técnico de Ton Long Kung Fu com velocidade e precisão',
    badgeOnImage: '🦗 Ton Long · Curta e Média Distância',
    desc: 'O estilo Ton Long (Louva-a-Deus) destaca-se pela velocidade de mãos, capturas rápidas, bloqueios angulares e contra-ataques imediatos em curta distância. Desenvolve reflexos apurados, coordenação motora fina e leitura biomecânica de combate.',
    highlights: [
      'Técnicas características de gancho, captura, controle articular e contra-ataque',
      'Katis tradicionais do sistema Ton Long e exercícios em dupla',
      'Aprimoramento de velocidade de reação, tempo de resposta e precisão técnica',
    ],
    ctaText: 'Conhecer o Ton Long',
    whatsappMessage: 'Olá! Gostaria de saber mais sobre as aulas de Ton Long no Núcleo de Kung Fu Shaolin.',
    reverse: true,
  },
  {
    id: 'taichi',
    name: 'Tai Chi Chuan',
    subtitle: 'Estilo Yang Tradicional & Chi Kung (氣功)',
    tag: 'Saúde & Equilíbrio',
    tagVariant: 'primary',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Prática de Tai Chi Chuan com foco em respiração e equilíbrio postural',
    badgeOnImage: '☯️ Estilo Yang · Respiração & Longevidade',
    desc: 'Prática marcial interna voltada ao equilíbrio postural, coordenação respiratória e fortalecimento sem impacto articular. Trabalha as sequências tradicionais do estilo Yang, exercícios de Chi Kung (Qi Gong) e formas com espada reta e leque.',
    highlights: [
      'Sequências tradicionais (Wu Hao de 8, 13, 24, 35, 38) e Espada Reta',
      'Fortalecimento de membros inferiores, estabilidade e consciência respiratória',
      'Indicado para jovens, adultos e idosos que buscam longevidade ativa',
    ],
    ctaText: 'Agendar Aula de Tai Chi Chuan',
    whatsappMessage: 'Olá! Tenho interesse em agendar uma aula experimental de Tai Chi Chuan.',
    reverse: false,
  },
  {
    id: 'sanda',
    name: 'Sanda · Boxe Chinês',
    subtitle: 'Combate Esportivo & Defesa Pessoal Aplicada',
    tag: 'Combate & Condicionamento',
    tagVariant: 'warning',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=900',
    imageAlt: 'Treinamento de Sanda Boxe Chinês com equipamentos de proteção',
    badgeOnImage: '🥊 Socos, Chutes & Projeções (Quedas)',
    desc: 'Modalidade de combate do Kung Fu que integra boxe, chutes em todas as alturas e projeções de queda (Shuai Jiao). Os treinos aliam preparo físico intenso, movimentação de luta e aplicação técnica com uso completo de equipamentos de proteção.',
    highlights: [
      'Combinações de punho e perna, entradas de queda e defesas de projeção',
      'Alto condicionamento cardiorrespiratório, explosão muscular e resistência',
      'Ambiente controlado e seguro sob supervisão direta dos instrutores',
    ],
    ctaText: 'Experimentar o Sanda',
    whatsappMessage: 'Olá! Quero agendar uma aula experimental de Sanda (Boxe Chinês).',
    reverse: true,
  },
]

const KIDS_BENEFITS = [
  {
    icon: '🎯',
    title: 'Foco, Atenção e Disciplina',
    desc: 'A criança aprende a ouvir, concentrar-se nas instruções e concluir tarefas com paciência — refletindo diretamente no desempenho escolar e na rotina em casa.',
  },
  {
    icon: '🤸',
    title: 'Coordenação Motora e Postura',
    desc: 'Exercícios dinâmicos de equilíbrio, lateralidade, rolamentos seguros e posturas marciais que estimulam o crescimento saudável longe do excesso de telas.',
  },
  {
    icon: '🤝',
    title: 'Respeito (Mo Duk) e Socialização',
    desc: 'Cultivamos o respeito aos pais, professores e colegas. A arte marcial é ensinada como instrumento de proteção e autocontrole, nunca de agressividade.',
  },
  {
    icon: '🛡️',
    title: 'Autoconfiança e Prevenção ao Bullying',
    desc: 'Crianças seguras de si desenvolvem postura firme, inteligência emocional e capacidade de estabelecer limites com serenidade e coragem.',
  },
]

const SCHOOL_PILLARS = [
  {
    icon: '🏯',
    title: 'Supervisão do Sifu Guilherme',
    desc: 'Metodologia fiel à linhagem tradicional, com correção técnica individualizada de posturas, respiração e execução marcial.',
  },
  {
    icon: '📈',
    title: 'Progressão Real por Domínio Técnico',
    desc: 'Cada graduação é conquistada pelo domínio real de bases, katis, chutes e aplicações avaliados em aula e em exames oficiais.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Turmas Separadas por Perfil',
    desc: 'Horários específicos para Kung Fu Kids (infantil), iniciantes, intermediários, avançados e faixas pretas.',
  },
  {
    icon: '📍',
    title: 'Estrutura na Vila Carrão',
    desc: 'Espaço preparado para práticas tradicionais, armas clássicas, Tai Chi Chuan e treinamento seguro de Sanda na Av. Conselheiro Carrão, 2737.',
  },
]

const FAQS = [
  {
    q: 'Preciso ter experiência prévia ou condicionamento físico para começar?',
    a: 'Não. As aulas para iniciantes respeitam a condição atual de cada pessoa. A mobilidade, a resistência e a coordenação técnica são construídas gradualmente aula a aula.',
  },
  {
    q: 'A partir de qual idade as crianças podem treinar no Kung Fu Kids?',
    a: 'Recebemos crianças a partir dos 5 anos na turma Siu Lung / Kung Fu Kids, com didática própria para a faixa etária, trabalhando psicomotricidade, disciplina e respeito.',
  },
  {
    q: 'Como faço para agendar uma aula experimental?',
    a: 'Basta clicar no botão de WhatsApp aqui no site e falar com nossa recepção pelo número (11) 2386-2729. A aula experimental permite conhecer nossa escola na Av. Conselheiro Carrão, 2737 e vivenciar o treino na prática.',
  },
  {
    q: 'Posso praticar mais de uma modalidade na escola?',
    a: 'Sim! Muitos praticantes combinam o Kung Fu (Choy Lay Fut e Ton Long) com o Sanda ou com o Tai Chi Chuan, desenvolvendo tanto a parte marcial externa quanto a interna.',
  },
]

const WHATSAPP_PRESETS = [
  {
    emoji: '🥋',
    label: 'Agendar aula experimental (Adulto / Jovem)',
    message: 'Olá! Gostaria de agendar uma aula experimental no Núcleo de Kung Fu Shaolin.',
  },
  {
    emoji: '🐉',
    label: 'Informações sobre Kung Fu Kids (Infantil)',
    message: 'Olá! Gostaria de informações e horários das turmas de Kung Fu Kids para crianças.',
  },
  {
    emoji: '🦗',
    label: 'Conhecer Choy Lay Fut, Ton Long ou Sanda',
    message: 'Olá! Quero saber mais sobre os horários de Choy Lay Fut, Ton Long e Sanda.',
  },
  {
    emoji: '☯️',
    label: 'Informações sobre Tai Chi Chuan',
    message: 'Olá! Gostaria de saber os dias e horários das aulas de Tai Chi Chuan.',
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
  const [isWaPopupOpen, setIsWaPopupOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main flex flex-col justify-between selection:bg-[var(--color-primary)] selection:text-white">
      {/* ── HEADER MODERNO E DIRETO (SEM FRASES GENÉRICAS) ─────────── */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-card)]/90 backdrop-blur-xl border-b border-[var(--color-border)] transition-all pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3">
          {/* Identidade da Escola */}
          <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
            <Logo size="sm" priority className="group-hover:scale-105 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[var(--color-text)] tracking-tight text-sm sm:text-base leading-tight truncate">
                Núcleo de Kung Fu Shaolin
              </span>
              <span className="text-[11px] text-muted font-medium hidden sm:block truncate">
                {SCHOOL_ADDRESS} · São Paulo
              </span>
            </div>
          </Link>

          {/* Navegação Central Desktop */}
          <nav
            aria-label="Navegação Principal"
            className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-semibold text-muted"
          >
            <a
              href="#modalidades"
              className="px-3 py-2 rounded-lg hover:text-main hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              Modalidades
            </a>
            <a
              href="#kids"
              className="px-3 py-2 rounded-lg hover:text-gold hover:bg-[var(--color-bg-elevated)] transition-colors flex items-center gap-1.5"
            >
              <span>🐉</span>
              <span>Kung Fu Kids</span>
            </a>
            <a
              href="#escola"
              className="px-3 py-2 rounded-lg hover:text-main hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              A Escola
            </a>
            <a
              href="#localizacao"
              className="px-3 py-2 rounded-lg hover:text-main hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              Endereço
            </a>
            <a
              href="#faq"
              className="px-3 py-2 rounded-lg hover:text-main hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              Dúvidas
            </a>
          </nav>

          {/* Ações Rápidas no Topo */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <a
              href={getWhatsAppUrl(
                'Olá! Gostaria de agendar uma aula experimental no Núcleo de Kung Fu Shaolin.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold btn-sm font-bold shadow-xs text-xs sm:text-sm px-3.5 sm:px-4 py-2 shrink-0 flex items-center gap-1.5"
            >
              <span>💬</span>
              <span>Agendar Aula</span>
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

        {/* ── HERO SECTION: DIRETO, AUTÊNTICO E SEM CLICHÊS ────────── */}
        <section className="relative overflow-hidden py-10 sm:py-16 lg:py-22 border-b border-[var(--color-border)]">
          {/* Iluminação de fundo sutil */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] bg-[var(--color-primary)] opacity-10 blur-[130px] pointer-events-none rounded-full" />
          <div className="absolute bottom-10 right-10 w-[360px] h-[360px] bg-[var(--color-gold)] opacity-10 blur-[130px] pointer-events-none rounded-full" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Coluna Esquerda: Apresentação Real da Escola */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Badge variant="gold">
                    📍 {SCHOOL_ADDRESS} · Vila Carrão
                  </Badge>
                  <span className="text-xs font-bold text-muted px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    Coordenação Técnica · Sifu Guilherme
                  </span>
                </div>

                <h1 className="text-[var(--color-text)] font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                  Artes Marciais Chinesas com{' '}
                  <span className="text-gold">
                    Linhagem e Método Tradicional.
                  </span>
                </h1>

                <p className="mt-4 text-base sm:text-lg font-medium text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
                  Ensino presencial de <strong>Kung Fu Choy Lay Fut</strong>,{' '}
                  <strong>Ton Long</strong>, <strong>Kung Fu Kids</strong>,{' '}
                  <strong>Tai Chi Chuan</strong> e <strong>Sanda (Boxe Chinês)</strong>.
                </p>

                <p className="nkfs-p-m text-muted mt-2.5 max-w-xl leading-relaxed">
                  Turmas estruturadas para crianças a partir dos 5 anos, jovens, adultos e idosos. Treinamento técnico de bases, formas clássicas (Katis), armas tradicionais e combate esportivo supervisionado.
                </p>

                {/* CTAs Diretos para Visitantes */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-7 w-full sm:w-auto">
                  <a
                    href={getWhatsAppUrl(
                      'Olá! Vi o site do Núcleo de Kung Fu Shaolin e gostaria de agendar uma aula experimental.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-lg shadow-md font-bold text-center px-6 py-3.5 flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    <span>Agendar Aula Experimental</span>
                  </a>
                  <a
                    href="#modalidades"
                    className="btn btn-outline btn-lg font-semibold text-center px-6 py-3.5"
                  >
                    Explorar Modalidades
                  </a>
                </div>

                {/* Destaques Objetivos das Modalidades no Hero */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-9 pt-6 border-t border-[var(--color-border)] w-full">
                  <a
                    href="#clf"
                    className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all"
                  >
                    <span className="text-xs font-extrabold text-gold block">Choy Lay Fut</span>
                    <span className="text-[11px] text-muted mt-0.5 block">Tradição Norte & Sul</span>
                  </a>
                  <a
                    href="#tonlong"
                    className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all"
                  >
                    <span className="text-xs font-extrabold text-gold block">Ton Long</span>
                    <span className="text-[11px] text-muted mt-0.5 block">Estilo Louva-a-Deus</span>
                  </a>
                  <a
                    href="#kids"
                    className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all"
                  >
                    <span className="text-xs font-extrabold text-gold block">Kung Fu Kids</span>
                    <span className="text-[11px] text-muted mt-0.5 block">Infantil (5+ anos)</span>
                  </a>
                  <a
                    href="#taichi"
                    className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all"
                  >
                    <span className="text-xs font-extrabold text-gold block">Tai Chi & Sanda</span>
                    <span className="text-[11px] text-muted mt-0.5 block">Saúde e Combate</span>
                  </a>
                </div>
              </div>

              {/* Coluna Direita: Imagem Editorial */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--color-border-gold)]/30 shadow-2xl bg-[var(--color-bg-card)] group aspect-[4/3] lg:aspect-[5/6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1000"
                    alt="Treinamento tradicional no Núcleo de Kung Fu Shaolin"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Card de Localização Flutuante */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
                          🏯
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs uppercase tracking-wider font-bold text-amber-300 block">
                            Escola Oficial · Sifu Guilherme
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-gray-200 truncate">
                            {SCHOOL_ADDRESS} · {WHATSAPP_DISPLAY}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selo Superior */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Aulas Experimentais Abertas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MODALIDADES MARCIAIS (CHOY LAY FUT, TON LONG, TAI CHI, SANDA) ── */}
        <section
          id="modalidades"
          className="py-14 sm:py-22 flex flex-col gap-16 sm:gap-24 border-b border-[var(--color-border)] scroll-mt-16"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full text-center">
            <Badge variant="gold">Artes Marciais Chinesas</Badge>
            <h2 className="nkfs-h-g text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl lg:text-4xl mt-2.5">
              Modalidades Ensinadas em Nossa Escola
            </h2>
            <p className="nkfs-p-m text-muted mt-2 max-w-2xl mx-auto">
              Conheça cada sistema marcial praticado no Núcleo de Kung Fu Shaolin e escolha a modalidade ideal para seus objetivos.
            </p>
          </div>

          {MODALITIES_SECTIONS.map((section, index) => (
            <div
              key={section.id}
              id={section.id}
              className="max-w-6xl mx-auto px-4 sm:px-6 w-full scroll-mt-20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Imagem da Modalidade */}
                <div
                  className={`lg:col-span-6 ${
                    section.reverse ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl bg-[var(--color-bg-card)] group aspect-[4/3] sm:aspect-[16/11]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={section.image}
                      alt={section.imageAlt}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                        {section.badgeOnImage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descrição Técnica da Modalidade */}
                <div
                  className={`lg:col-span-6 flex flex-col items-start ${
                    section.reverse ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="mb-2">
                    <Badge variant={section.tagVariant}>{section.tag}</Badge>
                  </div>

                  <h3 className="nkfs-h-g text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
                    {section.name}
                  </h3>

                  <span className="text-gold font-semibold text-sm sm:text-base mt-1">
                    {section.subtitle}
                  </span>

                  <p className="nkfs-p-m text-muted mt-3.5 leading-relaxed">
                    {section.desc}
                  </p>

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

                  <div className="mt-6 pt-4 border-t border-[var(--color-border)] w-full flex items-center justify-between">
                    <a
                      href={getWhatsAppUrl(section.whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-md font-semibold inline-flex items-center gap-2 group hover:border-[var(--color-gold)] hover:text-gold"
                    >
                      <span>{section.ctaText}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>

                    <span className="text-xs text-muted font-mono font-semibold">
                      0{index + 1} / 0{MODALITIES_SECTIONS.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── SEÇÃO ESPECIAL: KUNG FU KIDS (TURMAS INFANTIS SIU LUNG) ── */}
        <section
          id="kids"
          className="py-14 sm:py-22 bg-gradient-to-b from-[var(--color-bg-elevated)] to-[var(--color-bg)] border-b border-[var(--color-border)] scroll-mt-16 relative overflow-hidden"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Texto e Pilares Pedagógicos Kids */}
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="gold">🐉 Turmas Infantis · Siu Lung</Badge>
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                    A partir dos 5 anos
                  </span>
                </div>

                <h2 className="nkfs-h-g text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
                  Kung Fu Kids: Formação de Caráter, Coordenação e Foco para Crianças
                </h2>

                <p className="nkfs-p-m text-muted mt-3 leading-relaxed">
                  No <strong>Kung Fu Kids (Siu Lung)</strong>, as crianças aprendem os fundamentos do Kung Fu tradicional em aulas dinâmicas, seguras e adaptadas para cada fase do desenvolvimento infantil. Nosso foco vai além do movimento físico: trabalhamos a ética marcial (<em>Mo Duk</em>), o respeito aos pais e o autocontrole emocional.
                </p>

                {/* Grid de Benefícios para os Pais e Crianças */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6 w-full">
                  {KIDS_BENEFITS.map((item, idx) => (
                    <div
                      key={idx}
                      className="card p-4 border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-base shrink-0">
                          {item.icon}
                        </span>
                        <h3 className="text-xs sm:text-sm font-extrabold text-main">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <a
                    href={getWhatsAppUrl(
                      'Olá! Gostaria de agendar uma aula experimental de Kung Fu Kids para meu filho(a).'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-lg font-bold shadow-md px-6 py-3 flex items-center justify-center gap-2"
                  >
                    <span>🐉</span>
                    <span>Agendar Aula Experimental Kids</span>
                  </a>
                </div>
              </div>

              {/* Card Visual Kids */}
              <div className="lg:col-span-5">
                <div className="card-elevated p-5 sm:p-6 border border-[var(--color-border-gold)]/40 rounded-2xl shadow-xl flex flex-col gap-5 bg-[var(--color-bg-card)]">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-[var(--color-border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=900"
                      alt="Aulas de Kung Fu Kids focadas em disciplina, coordenação e respeito"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-xs font-bold bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15">
                        🥋 Metodologia Pedagógica Infantil
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-base font-extrabold text-main">
                      O que seu filho(a) vivencia nas aulas:
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-muted">
                      <li className="flex items-center gap-2">
                        <span className="text-gold font-bold">●</span>
                        <span>Aquecimento psicomotor, equilíbrio e agilidade</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gold font-bold">●</span>
                        <span>Posturas básicas e primeiros Katis tradicionais</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gold font-bold">●</span>
                        <span>Regras de convivência, saudação marcial e respeito</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gold font-bold">●</span>
                        <span>Sistema próprio de graduação e acompanhamento</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── NOSSA ESCOLA & ESTRUTURA (#escola) ─────────────────── */}
        <section
          id="escola"
          className="py-14 sm:py-20 bg-[var(--color-bg)] border-b border-[var(--color-border)] scroll-mt-16"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="gold">Nossa Escola</Badge>
              <h2 className="nkfs-h-m text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl mt-2.5">
                Ensino Sério, Ambiente Familiar e Tradição Marcial
              </h2>
              <p className="nkfs-p-m text-muted mt-2">
                No Núcleo de Kung Fu Shaolin, preservamos a ética marcial tradicional com acompanhamento próximo de cada praticante.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SCHOOL_PILLARS.map((p, idx) => (
                <div
                  key={idx}
                  className="card-elevated p-6 flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-[var(--color-gold)] transition-all group"
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

        {/* ── LOCALIZAÇÃO & CONTATO DIRETO (#localizacao) ─────────── */}
        <section
          id="localizacao"
          className="py-14 sm:py-20 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] scroll-mt-16"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="card p-6 sm:p-10 border border-[var(--color-border)] rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col items-start gap-3">
                <Badge variant="gold">📍 Visite Nossa Escola</Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
                  Venha conhecer nosso espaço de treino na Vila Carrão
                </h2>
                <p className="text-sm sm:text-base text-muted leading-relaxed max-w-xl">
                  Estamos localizados em ponto de fácil acesso na Zona Leste de São Paulo. Agende sua visita pelo WhatsApp ou venha assistir a uma aula presencialmente.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2">
                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-start gap-3">
                    <span className="text-xl shrink-0">📍</span>
                    <div>
                      <span className="text-xs uppercase font-bold text-gold block">
                        Endereço Oficial
                      </span>
                      <strong className="text-sm text-main block mt-0.5">
                        {SCHOOL_ADDRESS}
                      </strong>
                      <span className="text-xs text-muted block">
                        {SCHOOL_NEIGHBORHOOD}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-start gap-3">
                    <span className="text-xl shrink-0">📞</span>
                    <div>
                      <span className="text-xs uppercase font-bold text-gold block">
                        WhatsApp & Recepção
                      </span>
                      <strong className="text-sm text-main font-mono block mt-0.5">
                        {WHATSAPP_DISPLAY}
                      </strong>
                      <span className="text-xs text-muted block">
                        Atendimento de Seg. a Sáb.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3 w-full">
                <a
                  href={getWhatsAppUrl(
                    'Olá! Gostaria de agendar uma visita / aula experimental na Av. Conselheiro Carrão, 2737.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold btn-lg w-full font-bold shadow-md flex items-center justify-center gap-2 py-3.5"
                >
                  <span>💬</span>
                  <span>Chamar no WhatsApp {WHATSAPP_DISPLAY}</span>
                </a>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-lg w-full font-semibold flex items-center justify-center gap-2 py-3.5"
                >
                  <span>🗺️</span>
                  <span>Abrir no Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── DÚVIDAS FREQUENTES (FAQ) ────────────────────────────── */}
        <section
          id="faq"
          className="py-14 sm:py-20 border-b border-[var(--color-border)] scroll-mt-16"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <Badge variant="primary">Dúvidas Frequentes</Badge>
              <h2 className="nkfs-h-m text-[var(--color-text)] font-bold text-2xl sm:text-3xl mt-2.5">
                Perguntas Frequentes
              </h2>
              <p className="nkfs-p-m text-muted mt-2">
                Respostas diretas para quem deseja iniciar os treinos conosco.
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
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-[var(--color-text)] hover:text-gold transition-colors cursor-pointer"
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

        {/* ── SEÇÃO FINAL: ÁREA EXCLUSIVA PARA NOSSOS ALUNOS (APENAS ACESSAR) ── */}
        <section id="area-aluno" className="py-14 sm:py-20 scroll-mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="card-gold p-8 sm:p-12 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-gold)] flex items-center justify-center text-2xl mb-3 shadow-md">
                🥋
              </div>

              <Badge variant="gold">Ambiente Exclusivo para Alunos</Badge>

              <h2 className="nkfs-h-g text-[var(--color-text)] font-extrabold text-2xl sm:text-3xl md:text-4xl mt-3 max-w-xl">
                Já faz parte da nossa escola?
              </h2>

              <p className="nkfs-p-m text-muted mt-2.5 max-w-lg leading-relaxed">
                Contamos com uma área exclusiva para nossos alunos acompanharem sua ficha técnica oficial, horários da sua turma, mural de comunicados e vídeos técnicos da sua graduação.
              </p>

              <div className="mt-7 w-full max-w-xs">
                <Link
                  href="/login"
                  className="btn btn-gold btn-lg btn-full shadow-md font-extrabold text-center py-3.5 flex items-center justify-center gap-2"
                >
                  <span>🔐</span>
                  <span>Acessar Área do Aluno</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER REFORMULADO, MODERNO E COMPLETO ──────────────── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] text-muted pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[var(--color-border)]">
            {/* Coluna 1: Identidade da Escola (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-start gap-3">
              <div className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <span className="font-extrabold text-[var(--color-text)] text-base block leading-tight">
                    Núcleo de Kung Fu Shaolin
                  </span>
                  <span className="text-xs text-gold font-semibold">
                    Coordenação Técnica · Sifu Guilherme
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted leading-relaxed mt-1">
                Escola tradicional dedicada ao ensino autêntico das artes marciais chinesas, formando crianças, jovens e adultos com saúde, técnica e ética marcial.
              </p>
              <div className="flex items-center gap-2.5 mt-2">
                <a
                  href="https://www.instagram.com/nucleokungfushaolin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-gold)] text-xs font-semibold text-main transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/nucleokungfushaolin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-gold)] text-xs font-semibold text-main transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>

            {/* Coluna 2: Modalidades (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text)]">
                Modalidades
              </span>
              <ul className="flex flex-col gap-2 text-xs sm:text-sm">
                <li>
                  <a href="#clf" className="hover:text-gold transition-colors">
                    Kung Fu Choy Lay Fut
                  </a>
                </li>
                <li>
                  <a href="#tonlong" className="hover:text-gold transition-colors">
                    Ton Long (Louva-a-Deus)
                  </a>
                </li>
                <li>
                  <a href="#kids" className="hover:text-gold transition-colors">
                    Kung Fu Kids (Infantil)
                  </a>
                </li>
                <li>
                  <a href="#taichi" className="hover:text-gold transition-colors">
                    Tai Chi Chuan & Chi Kung
                  </a>
                </li>
                <li>
                  <a href="#sanda" className="hover:text-gold transition-colors">
                    Sanda / Boxe Chinês
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Acesso Rápido (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text)]">
                Navegação
              </span>
              <ul className="flex flex-col gap-2 text-xs sm:text-sm">
                <li>
                  <a href="#escola" className="hover:text-gold transition-colors">
                    Nossa Escola
                  </a>
                </li>
                <li>
                  <a href="#localizacao" className="hover:text-gold transition-colors">
                    Localização
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-gold transition-colors">
                    Dúvidas Frequentes
                  </a>
                </li>
                <li>
                  <Link href="/login" className="text-gold font-bold hover:underline">
                    Área do Aluno →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Endereço & WhatsApp (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text)]">
                Endereço & Contato
              </span>
              <div className="flex flex-col gap-2 text-xs sm:text-sm">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors leading-snug"
                >
                  📍 <strong className="text-main">{SCHOOL_ADDRESS}</strong>
                  <span className="block text-xs text-muted mt-0.5">
                    {SCHOOL_NEIGHBORHOOD}
                  </span>
                </a>
                <a
                  href={getWhatsAppUrl('Olá! Vim pelo site do Núcleo de Kung Fu Shaolin.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors font-mono font-semibold text-main mt-1"
                >
                  💬 WhatsApp: {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
          </div>

          {/* Barra Inferior de Direitos */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint">
            <span>
              © 2026 Núcleo de Kung Fu Shaolin · Todos os direitos reservados.
            </span>
            <span>
              {SCHOOL_ADDRESS} · Tel/WhatsApp {WHATSAPP_DISPLAY}
            </span>
          </div>
        </div>
      </footer>

      {/* ── POPUP INTERATIVO DO WHATSAPP (FLUTUANTE) ────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {isWaPopupOpen && (
          <div className="w-[320px] sm:w-[350px] rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-[var(--color-bg-card)] animate-fade-in">
            {/* Cabeçalho Verde do Popup WhatsApp */}
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-lg shrink-0">
                  🥋
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold leading-tight truncate">
                    Núcleo de Kung Fu Shaolin
                  </h4>
                  <span className="text-[11px] text-emerald-200 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Atendimento Online · {WHATSAPP_DISPLAY}</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWaPopupOpen(false)}
                className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-xs font-bold text-white cursor-pointer shrink-0"
                aria-label="Fechar atendimento WhatsApp"
              >
                ✕
              </button>
            </div>

            {/* Corpo do Chat */}
            <div className="p-4 flex flex-col gap-3 bg-[var(--color-bg-elevated)]">
              <div className="p-3 rounded-xl rounded-tl-xs bg-[var(--color-bg-card)] border border-[var(--color-border)] text-xs text-main leading-relaxed shadow-2xs">
                <span className="font-bold text-gold block mb-1">
                  Recepção · Núcleo Shaolin
                </span>
                Olá! 👋 Estamos na <strong>{SCHOOL_ADDRESS}</strong>. Escolha um assunto abaixo para falar conosco no WhatsApp:
              </div>

              {/* Opções Rápidas */}
              <div className="flex flex-col gap-1.5">
                {WHATSAPP_PRESETS.map((preset, idx) => (
                  <a
                    key={idx}
                    href={getWhatsAppUrl(preset.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[var(--color-bg-card)] hover:bg-emerald-500/10 border border-[var(--color-border)] hover:border-emerald-500/40 text-xs font-semibold text-main transition-all flex items-center justify-between gap-2 group"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0">{preset.emoji}</span>
                      <span className="truncate">{preset.label}</span>
                    </span>
                    <span className="text-emerald-500 font-bold group-hover:translate-x-0.5 transition-transform shrink-0">
                      →
                    </span>
                  </a>
                ))}
              </div>

              {/* Botão Principal Direto */}
              <a
                href={getWhatsAppUrl('Olá! Vim pelo site do Núcleo de Kung Fu Shaolin e gostaria de atendimento.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-black font-extrabold text-xs sm:text-sm text-center shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>Iniciar Conversa no WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Botão Flutuante de Abertura do Popup */}
        <button
          type="button"
          onClick={() => setIsWaPopupOpen((prev) => !prev)}
          className="group flex items-center gap-2.5 pl-4 pr-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-black font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-white/20"
          aria-label="Abrir atendimento via WhatsApp"
        >
          <span className="text-lg leading-none">💬</span>
          <span>WhatsApp</span>
          <span className="w-2 h-2 rounded-full bg-black/70 animate-ping" />
        </button>
      </div>
    </div>
  )
}
