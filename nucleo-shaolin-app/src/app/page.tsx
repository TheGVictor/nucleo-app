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

// Centralização das imagens para substituição rápida pelas fotos reais da Núcleo
const SITE_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1000',
  clf: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=900',
  tonlong:
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=900',
  taichi:
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=900',
  sanda:
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=900',
  student1:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  student2:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  student3:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  footerBg:
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1600',
}

function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

interface ModalityItem {
  id: string
  name: string
  subtitle: string
  image: string
  imageAlt: string
  desc: string
  highlights: string[]
}

const MODALITIES: ModalityItem[] = [
  {
    id: 'clf',
    name: 'Kung Fu Choy Lay Fut',
    subtitle: 'Tradição do Norte e Sul da China',
    image: SITE_IMAGES.clf,
    imageAlt: 'Treinamento de Kung Fu Choy Lay Fut na Núcleo',
    desc: 'Une a agilidade de deslocamento e chutes do Norte com a potência de braços e bases firmes do Sul. Abrange formas clássicas (Katis), defesa pessoal e armas tradicionais.',
    highlights: [
      'Bases tradicionais, deslocamentos e potência de quadril',
      'Formas clássicas de mãos livres e armas (bastão, sabre e lança)',
      'Progressão técnica estruturada faixa a faixa',
    ],
  },
  {
    id: 'tonlong',
    name: 'Ton Long Kung Fu',
    subtitle: 'Estilo Louva-a-Deus Tradicional',
    image: SITE_IMAGES.tonlong,
    imageAlt: 'Treinamento técnico de Ton Long Kung Fu na Núcleo',
    desc: 'Reconhecido pela velocidade de mãos, capturas rápidas, bloqueios angulares e contra-ataques imediatos em curta distância, desenvolvendo reflexos apurados e precisão.',
    highlights: [
      'Técnicas de gancho, captura e controle articular',
      'Katis tradicionais do sistema Ton Long e aplicações em dupla',
      'Velocidade de reação e coordenação motora fina',
    ],
  },
  {
    id: 'taichi',
    name: 'Tai Chi Chuan',
    subtitle: 'Estilo Yang Tradicional & Chi Kung',
    image: SITE_IMAGES.taichi,
    imageAlt: 'Prática de Tai Chi Chuan na Núcleo',
    desc: 'Arte marcial interna voltada ao equilíbrio postural, coordenação respiratória e fortalecimento sem impacto articular, trabalhando sequências clássicas, espada reta e leque.',
    highlights: [
      'Sequências tradicionais do estilo Yang e Espada Reta',
      'Fortalecimento, estabilidade e consciência respiratória',
      'Indicado para jovens, adultos e idosos',
    ],
  },
  {
    id: 'sanda',
    name: 'Sanda · Boxe Chinês',
    subtitle: 'Combate Esportivo & Defesa Pessoal',
    image: SITE_IMAGES.sanda,
    imageAlt: 'Treinamento de Sanda Boxe Chinês na Núcleo',
    desc: 'Modalidade de combate do Kung Fu que integra boxe, chutes e projeções de queda. Treinos dinâmicos de alto condicionamento físico com equipamentos de proteção.',
    highlights: [
      'Combinações de punho, chute e entradas de queda',
      'Condicionamento cardiorrespiratório e explosão muscular',
      'Prática supervisionada em ambiente seguro e controlado',
    ],
  },
]

const METHODOLOGY_STEPS = [
  {
    step: '01',
    badge: '60 Minutos',
    title: 'Aulas na Medida da Sua Rotina',
    desc: 'Treinos planejados de 60 minutos divididos entre aquecimento, base técnica, prática marcial e retorno à calma — fáceis de conciliar com o seu dia a dia.',
  },
  {
    step: '02',
    badge: 'No Seu Ritmo',
    title: 'Evolução Individual e Sem Comparações',
    desc: 'O ensino na Núcleo é adaptado à condição física e à idade de cada aluno. Você aprende desde o zero absoluto, respeitando o seu próprio tempo.',
  },
  {
    step: '03',
    badge: 'Acompanhamento Real',
    title: 'Ficha Técnica & Vídeos por Faixa',
    desc: 'Cada praticante conta com acompanhamento individual do currículo da sua graduação e acesso ao portal da Núcleo com vídeos de apoio.',
  },
  {
    step: '04',
    badge: 'Corpo e Mente',
    title: 'Saúde, Postura e Equilíbrio Mental',
    desc: 'Mais do que defesa pessoal: o treinamento desenvolve foco, controle emocional, disciplina, mobilidade e condicionamento de dentro para fora.',
  },
]

const KIDS_BENEFITS = [
  {
    title: 'Foco e Disciplina',
    desc: 'Desenvolve atenção, paciência e escuta ativa com reflexo direto nos estudos e em casa.',
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
    desc: 'Segurança emocional, postura firme e autocontrole em um ambiente acolhedor.',
  },
]

interface TestimonialItem {
  name: string
  role: string
  photo: string
  belt: string
  beltColor: string
  trainingTime: string
  modality: string
  quote: string
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Mariana Costa',
    role: 'Aluna da Turma Adulta',
    photo: SITE_IMAGES.student1,
    belt: 'Faixa Verde',
    beltColor: '#10B981',
    trainingTime: '2 anos e meio de treino',
    modality: 'Kung Fu Choy Lay Fut & Ton Long',
    quote:
      'Comecei na Núcleo sem nunca ter praticado artes marciais. As aulas de 60 minutos transformaram meu condicionamento físico, minha postura e meu foco. Ter a ficha técnica de acompanhamento deixa muito claro cada passo da nossa evolução.',
  },
  {
    name: 'Patrícia Santos',
    role: 'Mãe do Lucas (8 anos)',
    photo: SITE_IMAGES.student2,
    belt: 'Faixa Amarela',
    beltColor: '#F59E0B',
    trainingTime: '1 ano e meio de treino',
    modality: 'Kung Fu Kids',
    quote:
      'A evolução do Lucas na concentração, coordenação motora e respeito em casa e na escola foi nítida. O ambiente da Núcleo é familiar e acolhedor, e ele espera a semana inteira pelos dias de treino.',
  },
  {
    name: 'Carlos Eduardo',
    role: 'Aluno de Práticas Internas',
    photo: SITE_IMAGES.student3,
    belt: '3º Nível — Laranja',
    beltColor: '#F97316',
    trainingTime: '3 anos de treino',
    modality: 'Tai Chi Chuan',
    quote:
      'Buscava uma prática que cuidasse da saúde articular e do controle da ansiedade. O método tradicional ensinado na Núcleo trouxe mais equilíbrio, disposição diária e uma verdadeira família.',
  },
]

const FAQS = [
  {
    q: 'Preciso ter experiência prévia para começar a treinar na Núcleo?',
    a: 'Não. As turmas iniciantes da Núcleo respeitam o ritmo individual de cada pessoa, construindo base, mobilidade e condicionamento de forma gradual desde a primeira aula.',
  },
  {
    q: 'A partir de qual idade as crianças podem entrar no Kung Fu Kids?',
    a: 'Recebemos crianças a partir dos 5 anos nas turmas infantis da Núcleo, com metodologia pedagógica e marcial adaptada para a faixa etária.',
  },
  {
    q: 'Onde fica a Núcleo e como agendar uma aula experimental?',
    a: 'Estamos na Av. Conselheiro Carrão, 2737 (Vila Carrão, São Paulo). Basta clicar no botão do WhatsApp para falar diretamente com a recepção da Núcleo pelo número (11) 2386-2729.',
  },
  {
    q: 'Posso praticar mais de uma modalidade na escola?',
    a: 'Sim. Na Núcleo você pode combinar Kung Fu (Choy Lay Fut e Ton Long) com Sanda ou Tai Chi Chuan conforme sua disponibilidade de horários.',
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
                'Olá! Gostaria de agendar uma aula experimental na Núcleo de Kung Fu Shaolin.'
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

        {/* ── 1. HERO SECTION ───────────────────────────────────────── */}
        <section className="py-12 sm:py-20 lg:py-24 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-gold mb-4">
                  <span>📍</span>
                  <span>{SCHOOL_ADDRESS} · Vila Carrão, SP</span>
                </span>

                <h1 className="text-[var(--color-text)] font-extrabold tracking-tight text-3xl sm:text-5xl leading-[1.12]">
                  Tradição e Método nas{' '}
                  <span className="text-gold">Artes Marciais Chinesas.</span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-muted max-w-xl leading-relaxed">
                  A <strong className="text-main">Núcleo de Kung Fu Shaolin</strong> oferece ensino presencial de{' '}
                  <strong className="text-main">Kung Fu Choy Lay Fut</strong>,{' '}
                  <strong className="text-main">Ton Long</strong>,{' '}
                  <strong className="text-main">Kung Fu Kids</strong>,{' '}
                  <strong className="text-main">Tai Chi Chuan</strong> e{' '}
                  <strong className="text-main">Sanda (Boxe Chinês)</strong> para crianças, jovens, adultos e idosos.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={getWhatsAppUrl(
                      'Olá! Gostaria de agendar uma aula experimental na Núcleo de Kung Fu Shaolin.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-lg font-bold px-7 py-3.5 shadow-sm inline-flex items-center gap-2"
                  >
                    <span>Agendar Aula Experimental</span>
                  </a>
                </div>

                {/* Indicadores rápidos e limpos */}
                <div className="mt-10 pt-6 border-t border-[var(--color-border)] grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-lg">
                  <div>
                    <span className="block text-base sm:text-lg font-extrabold text-main">
                      60 min
                    </span>
                    <span className="text-xs text-muted">
                      Duração de cada aula
                    </span>
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-extrabold text-main">
                      5+ anos
                    </span>
                    <span className="text-xs text-muted">
                      Turmas Kids e Adultos
                    </span>
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-extrabold text-main">
                      100%
                    </span>
                    <span className="text-xs text-muted">
                      Ritmo individualizado
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl aspect-[4/3] lg:aspect-[5/6] bg-[var(--color-bg-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SITE_IMAGES.hero}
                    alt="Treinamento tradicional na Núcleo de Kung Fu Shaolin"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. COMO FUNCIONA NA PRÁTICA (LAYOUT EDITORIAL NUMERADO, SEM POLUIÇÃO DE IMAGEM) ── */}
        <section className="py-16 sm:py-24 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Metodologia da Núcleo
              </span>
              <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-1.5 tracking-tight">
                Como Funciona Seu Treino na Prática
              </h2>
              <p className="text-sm sm:text-base text-muted mt-2.5 leading-relaxed">
                Não é preciso ter experiência prévia ou condicionamento avançado. Na Núcleo, cada etapa do aprendizado é estruturada para você evoluir com segurança e constância.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {METHODOLOGY_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all p-6 flex flex-col justify-between gap-6 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-black text-gold/80 font-mono">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-gold">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-main leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. MODALIDADES DA NÚCLEO (GRID 2x2 MODERNO E INTUITIVO) ──── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Sistemas Marciais
              </span>
              <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-1.5 tracking-tight">
                Modalidades da Núcleo
              </h2>
              <p className="text-sm sm:text-base text-muted mt-2.5 leading-relaxed">
                Quatro vertentes tradicionais das artes marciais chinesas ensinadas com currículo técnico completo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {MODALITIES.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all overflow-hidden flex flex-col justify-between shadow-xs group"
                >
                  <div>
                    <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mod.image}
                        alt={mod.imageAlt}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-6 sm:p-7">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                        {mod.subtitle}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-main mt-1 tracking-tight">
                        {mod.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted mt-2.5 leading-relaxed">
                        {mod.desc}
                      </p>

                      <ul className="space-y-2 mt-5 pt-4 border-t border-[var(--color-border)]">
                        {mod.highlights.map((h, hIdx) => (
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

                  <div className="px-6 sm:px-7 pb-6">
                    <a
                      href={getWhatsAppUrl(
                        `Olá! Gostaria de agendar uma aula experimental de ${mod.name} na Núcleo.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-bold text-gold hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>Agendar aula de {mod.name}</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. KUNG FU KIDS (LAYOUT EDITORIAL LIMPO, SEM FOTO REPETITIVA) ── */}
        <section className="py-16 sm:py-24 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 sm:p-10 lg:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-5 flex flex-col items-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-gold">
                    🐉 Turmas Infantis · A partir dos 5 anos
                  </span>

                  <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-3 tracking-tight">
                    Kung Fu Kids na Núcleo
                  </h2>

                  <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
                    Aulas estruturadas para o desenvolvimento motor, emocional e social da criança, trabalhando coordenação, atenção e os valores tradicionais da ética marcial (<em>Mo Duk</em>).
                  </p>

                  <div className="mt-7">
                    <a
                      href={getWhatsAppUrl(
                        'Olá! Gostaria de informações sobre o Kung Fu Kids na Núcleo.'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-gold btn-md font-bold px-6 py-3"
                    >
                      Agendar Aula Experimental Kids
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {KIDS_BENEFITS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] shrink-0" />
                        <h3 className="text-sm sm:text-base font-extrabold text-main">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed pl-4">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. DEPOIMENTOS COM FOTOS DOS ALUNOS, FAIXA E TEMPO DE TREINO ── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Comunidade Marcial
              </span>
              <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-1.5 tracking-tight">
                Quem Treina na Núcleo Conta Como É
              </h2>
              <p className="text-sm sm:text-base text-muted mt-2.5 leading-relaxed">
                Relatos reais de alunos e famílias sobre a rotina de treinos, saúde e evolução dentro da Núcleo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all p-6 flex flex-col justify-between gap-6 shadow-xs"
                >
                  <div className="flex flex-col gap-4">
                    {/* Cabeçalho com Foto do Aluno + Nome + Modalidade */}
                    <div className="flex items-center gap-3.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/30 shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-main truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted truncate">
                          {item.modality}
                        </p>
                      </div>
                    </div>

                    {/* Faixa + Tempo de Treino na Núcleo */}
                    <div className="flex items-center justify-between gap-2 flex-wrap py-2 px-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-main">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.beltColor }}
                        />
                        <span>{item.belt}</span>
                      </span>
                      <span className="text-[11px] font-bold text-gold">
                        {item.trainingTime}
                      </span>
                    </div>

                    {/* Relato */}
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-faint font-semibold">
                    <span>{item.role}</span>
                    <span>Núcleo Shaolin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. DÚVIDAS FREQUENTES (FAQ) ───────────────────────────── */}
        <section className="py-16 sm:py-24 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
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

        {/* ── 7. SEÇÃO FINAL: ÁREA EXCLUSIVA PARA NOSSOS ALUNOS (APENAS ACESSAR) ── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-[var(--color-border-gold)]/40 bg-[var(--color-bg-card)] p-8 sm:p-10 text-center flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Portal Oficial da Escola
              </span>

              <h2 className="text-[var(--color-text)] font-extrabold text-xl sm:text-2xl mt-2">
                Área Exclusiva para Alunos da Núcleo
              </h2>

              <p className="text-sm text-muted mt-2 max-w-md leading-relaxed">
                Acesso restrito aos alunos matriculados na Núcleo para consulta de ficha técnica, grade de horários, mural de avisos e vídeos de treino.
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

      {/* ── FOOTER MODERNO COM IMAGEM DE BACKGROUND (SEM ATALHOS INTERNOS E SEM MENÇÃO EXPLÍCITA AO SIFU) ── */}
      <footer className="relative border-t border-[var(--color-border)] text-neutral-300 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SITE_IMAGES.footerBg}
            alt="Núcleo de Kung Fu Shaolin"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/88 to-black/80 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/15">
            <div className="flex items-center gap-3.5">
              <Logo size="sm" />
              <div>
                <span className="font-extrabold !text-white text-base sm:text-lg block tracking-tight">
                  Núcleo de Kung Fu Shaolin
                </span>
                <span className="text-xs !text-amber-400 font-semibold">
                  Escola Tradicional de Artes Marciais Chinesas
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-xs sm:text-sm">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="!text-neutral-200 hover:!text-amber-400 transition-colors"
              >
                <strong className="!text-white">{SCHOOL_ADDRESS}</strong> · {SCHOOL_NEIGHBORHOOD}
              </a>

              <a
                href={getWhatsAppUrl('Olá! Vim pelo site da Núcleo de Kung Fu Shaolin.')}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:!text-amber-400 transition-colors font-bold !text-white"
              >
                WhatsApp: {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs !text-neutral-400">
            <span>
              © 2026 Núcleo de Kung Fu Shaolin. Todos os direitos reservados.
            </span>

            <div className="flex items-center gap-5 font-medium">
              <a
                href="https://www.instagram.com/nucleokungfushaolin/"
                target="_blank"
                rel="noopener noreferrer"
                className="!text-neutral-300 hover:!text-amber-400 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/nucleokungfushaolin/"
                target="_blank"
                rel="noopener noreferrer"
                className="!text-neutral-300 hover:!text-amber-400 transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── BOTÃO FLUTUANTE DO WHATSAPP (APENAS O BOTÃO, SEM CHAT ABERTO) ── */}
      <a
        href={getWhatsAppUrl('Olá! Vim pelo site da Núcleo de Kung Fu Shaolin e gostaria de informações.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        title={`WhatsApp ${WHATSAPP_DISPLAY}`}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] !text-white shadow-lg hover:scale-105 transition-all flex items-center justify-center"
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
