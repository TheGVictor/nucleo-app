'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Clock,
  TrendingUp,
  FileCheck2,
  HeartPulse,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  Target,
  Activity,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Lock,
  Phone,
  Flame,
  Swords,
  Wind,
  Shield,
  MessageCircle,
  FileText,
  Video,
  ShoppingBag,
  Bell,
  Smartphone,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const WHATSAPP_NUMBER = '551123862729'
const WHATSAPP_DISPLAY = '(11) 2386-2729'
const SCHOOL_ADDRESS = 'Av. Conselheiro Carrão, 2737'
const SCHOOL_NEIGHBORHOOD = 'Vila Carrão · São Paulo - SP'
const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Av.+Conselheiro+Carrao,+2737+-+Vila+Carrao,+Sao+Paulo+-+SP'

// Imagens oficiais da Núcleo tratadas em alta definição (nível estúdio/câmera profissional)
const SITE_IMAGES = {
  hero: '/imgNucleo/nucleo6.jpg',
  clf: '/imgNucleo/nucleo1.jpg',
  tonlong: '/imgNucleo/nucleo3.jpg',
  taichi: '/imgNucleo/nucleo2.jpg',
  sanda: '/imgNucleo/nucleo4.jpg',
  kids: '/imgNucleo/nucleo5.jpg',
  footerBg: '/imgNucleo/nucleo2.jpg',
  student1:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  student2:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  student3:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
}

function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

const MODALITIES = [
  {
    id: 'clf',
    name: 'Kung Fu Choy Lay Fut',
    subtitle: 'Tradição do Norte e Sul da China',
    icon: Flame,
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
    icon: Swords,
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
    icon: Wind,
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
    icon: Shield,
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
    icon: Clock,
    title: 'Aulas na Medida da Sua Rotina',
    desc: 'Treinos planejados de 60 minutos divididos entre aquecimento, base técnica, prática marcial e retorno à calma — fáceis de conciliar com o seu dia a dia.',
  },
  {
    icon: TrendingUp,
    title: 'Evolução Individual e Sem Comparações',
    desc: 'O ensino na Núcleo é adaptado à condição física e à idade de cada aluno. Você aprende desde o zero absoluto, respeitando o seu próprio tempo.',
  },
  {
    icon: FileCheck2,
    title: 'Ficha Técnica & Vídeos por Faixa',
    desc: 'Cada praticante conta com acompanhamento individual do currículo da sua graduação e acesso ao portal da Núcleo com vídeos de apoio.',
  },
  {
    icon: HeartPulse,
    title: 'Saúde, Postura e Equilíbrio Mental',
    desc: 'Mais do que defesa pessoal: o treinamento desenvolve foco, controle emocional, disciplina, mobilidade e condicionamento de dentro para fora.',
  },
]

const KIDS_BENEFITS = [
  {
    icon: Target,
    title: 'Foco e Disciplina',
    desc: 'Desenvolve atenção, paciência e escuta ativa com reflexo direto nos estudos e em casa.',
  },
  {
    icon: Activity,
    title: 'Coordenação e Postura',
    desc: 'Equilíbrio, lateralidade e consciência corporal longe do excesso de telas.',
  },
  {
    icon: HeartHandshake,
    title: 'Respeito (Mo Duk)',
    desc: 'Valorização do respeito aos pais, professores e colegas através da ética marcial.',
  },
  {
    icon: ShieldCheck,
    title: 'Autoconfiança',
    desc: 'Segurança emocional, postura firme e autocontrole em um ambiente acolhedor.',
  },
]

interface TestimonialItem {
  name: string
  role: string
  photo: string
  quote: string
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Mariana Costa',
    role: 'Faixa Verde · Kung Fu',
    photo: SITE_IMAGES.student1,
    quote:
      'Comecei na Núcleo sem nunca ter praticado artes marciais. As aulas transformaram meu condicionamento físico, minha postura e meu foco. Ter o acompanhamento passo a passo deixa muito claro cada etapa da nossa evolução.',
  },
  {
    name: 'Patrícia Santos',
    role: 'Mãe do Lucas (Turma Kids)',
    photo: SITE_IMAGES.student2,
    quote:
      'A evolução do Lucas na concentração, coordenação motora e respeito em casa e na escola foi nítida. O ambiente da Núcleo é familiar e acolhedor, e ele espera a semana inteira pelos dias de treino.',
  },
  {
    name: 'Carlos Eduardo',
    role: 'Praticante · Tai Chi Chuan',
    photo: SITE_IMAGES.student3,
    quote:
      'Buscava uma prática que cuidasse da saúde articular e do equilíbrio mental. O método tradicional da Núcleo trouxe mais equilíbrio, disposição diária e uma verdadeira comunidade.',
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
            <a
              href={getWhatsAppUrl(
                'Olá! Gostaria de mais informações sobre as aulas na Núcleo de Kung Fu Shaolin.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold btn-sm font-bold text-xs sm:text-sm px-4 py-2 shrink-0 inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Falar no WhatsApp</span>
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
              <div className="lg:col-span-6 flex flex-col items-start text-left">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-gold mb-4">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{SCHOOL_ADDRESS} · Vila Carrão, SP</span>
                </span>

                <h1 className="text-[var(--color-text)] font-extrabold tracking-tight text-3xl sm:text-5xl lg:text-6xl leading-[1.12]">
                  Núcleo de <span className="text-gold">Kung Fu Shaolin</span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-muted max-w-xl leading-relaxed">
                  Escola tradicional dedicada ao desenvolvimento físico, mental e marcial. Com metodologia estruturada e acompanhamento próximo, proporcionamos saúde, disciplina, foco e autodefesa para crianças, jovens e adultos.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={getWhatsAppUrl(
                      'Olá! Gostaria de informações sobre os treinos na Núcleo de Kung Fu Shaolin.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-lg font-bold px-7 py-3.5 shadow-sm inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 shrink-0" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>

                {/* Indicadores rápidos com ícones */}
                <div className="mt-10 pt-6 border-t border-[var(--color-border)] grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-lg">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-gold shrink-0 mt-1" />
                    <div>
                      <span className="block text-sm sm:text-base font-extrabold text-main">
                        Do Zero
                      </span>
                      <span className="text-xs text-muted">
                        Iniciantes bem-vindos
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-gold shrink-0 mt-1" />
                    <div>
                      <span className="block text-sm sm:text-base font-extrabold text-main">
                        5+ anos
                      </span>
                      <span className="text-xs text-muted">
                        Kids e Adultos
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-gold shrink-0 mt-1" />
                    <div>
                      <span className="block text-sm sm:text-base font-extrabold text-main">
                        100%
                      </span>
                      <span className="text-xs text-muted">
                        No seu ritmo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl aspect-[3/2] bg-[var(--color-bg-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SITE_IMAGES.hero}
                    alt="Treinamento tradicional na Núcleo de Kung Fu Shaolin"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. COMO FUNCIONA NA PRÁTICA (COM ÍCONES ILUSTRATIVOS EM CADA TÓPICO) ── */}
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
              {METHODOLOGY_STEPS.map((item, idx) => {
                const StepIcon = item.icon
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all p-6 sm:p-7 flex flex-col items-center text-center gap-4 shadow-xs group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/12 border border-amber-500/30 flex items-center justify-center text-gold shrink-0 group-hover:scale-110 transition-transform">
                      <StepIcon className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-base font-extrabold text-main leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 3. MODALIDADES DA NÚCLEO (GRID 2x2 MODERNO COM ÍCONES) ──── */}
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
              {MODALITIES.map((mod) => {
                const ModIcon = mod.icon
                return (
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
                        <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center !text-amber-400">
                          <ModIcon className="w-4 h-4" />
                        </div>
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
                              <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="px-6 sm:px-7 pb-6">
                      <a
                        href={getWhatsAppUrl(
                          `Olá! Gostaria de mais informações sobre os treinos de ${mod.name} na Núcleo de Kung Fu Shaolin.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-bold text-gold hover:underline inline-flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Falar no WhatsApp sobre {mod.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 4. KUNG FU KIDS (COM FOTO OFICIAL E ÍCONES EM CADA PILAR INFANTIL) ── */}
        <section className="py-16 sm:py-24 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 sm:p-10 lg:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7 flex flex-col items-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-gold">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Turmas Infantis · A partir dos 5 anos</span>
                  </span>

                  <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-3 tracking-tight">
                    Kung Fu Kids na Núcleo
                  </h2>

                  <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
                    Aulas estruturadas para o desenvolvimento motor, emocional e social da criança, trabalhando coordenação, atenção e os valores tradicionais da ética marcial (<em>Mo Duk</em>).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7 w-full">
                    {KIDS_BENEFITS.map((item, idx) => {
                      const BenefitIcon = item.icon
                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold shrink-0">
                              <BenefitIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-main">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-muted leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-7">
                    <a
                      href={getWhatsAppUrl(
                        'Olá! Gostaria de informações sobre as turmas de Kung Fu Kids na Núcleo de Kung Fu Shaolin.'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-gold btn-md font-bold px-6 py-3 inline-flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>Falar no WhatsApp sobre Kung Fu Kids</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] aspect-[3/4] bg-[var(--color-bg-elevated)] shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={SITE_IMAGES.kids}
                      alt="Alunos e tradição marcial no Kung Fu Kids da Núcleo"
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  </div>
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
                  className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all p-6 flex flex-col justify-between gap-5 shadow-xs"
                >
                  <div className="flex flex-col gap-4">
                    {/* Foto, Nome e Descrição simples e clean */}
                    <div className="flex items-center gap-3.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/25 shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-main truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted truncate mt-0.5">
                          {item.role}
                        </p>
                      </div>
                    </div>

                    {/* Relato */}
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. PORTAL DO ALUNO (INTEGRADO, ELEGANTE & ACIMA DA FAQ) ── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-gold)] p-6 sm:p-10 lg:p-12 shadow-sm transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Informações da Área do Aluno */}
                <div className="lg:col-span-7 flex flex-col items-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-gold">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Portal do Praticante · Exclusivo para Alunos</span>
                  </span>

                  <h2 className="text-[var(--color-text)] font-extrabold text-2xl sm:text-4xl mt-3 tracking-tight">
                    Tecnologia e Método na Sua Prática
                  </h2>

                  <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
                    Na Núcleo, seu aprendizado não para ao sair da escola. Cada aluno matriculado tem acesso a uma plataforma exclusiva para consultar a ficha técnica da sua graduação, revisar vídeos de treino e acompanhar avisos em tempo real.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7 w-full">
                    <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-main">
                          Ficha Técnica da Faixa
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">
                        Katis, defesas, chutes e critérios de avaliação do seu exame.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-main">
                          Vídeos de Apoio
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">
                        Gravações detalhadas para revisar e aperfeiçoar cada movimento.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-main">
                          Mural & Comunicados
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">
                        Avisos de graduação, eventos e grade de aulas atualizada.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-main">
                          Loja da Escola
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">
                        Uniformes oficiais, faixas, armas tradicionais e equipamentos.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/login"
                      className="btn btn-gold btn-md font-bold px-7 py-3 inline-flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>Entrar na Área do Aluno</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                    <span className="text-xs text-muted inline-flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-gold shrink-0" />
                      <span>Disponível no celular (PWA) ou computador</span>
                    </span>
                  </div>
                </div>

                {/* Card de Preview da Área do Aluno */}
                <div className="lg:col-span-5 flex justify-center w-full">
                  <div className="w-full max-w-sm rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-5 shadow-xs flex flex-col gap-3.5">
                    {/* Header do Aluno */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold font-bold text-xs shrink-0">
                          NK
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-main block truncate">
                            Portal do Praticante
                          </span>
                          <span className="text-[11px] text-muted block truncate">
                            Núcleo de Kung Fu Shaolin
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 shrink-0">
                        Matrícula Ativa
                      </span>
                    </div>

                    {/* Graduação Atual */}
                    <div className="p-3.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-main">
                          Kung Fu Choy Lay Fut
                        </span>
                        <span className="text-[10px] font-bold text-gold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25">
                          Faixa Verde
                        </span>
                      </div>
                      <div className="w-full bg-[var(--color-bg-elevated)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-3/4 rounded-full" />
                      </div>
                      <span className="text-[10px] text-muted text-right">
                        Currículo em evolução
                      </span>
                    </div>

                    {/* Acessos Rápidos */}
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-main font-medium">
                          <FileText className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>Ficha Técnica da Graduação</span>
                        </div>
                        <span className="text-[11px] text-gold font-bold">Abrir &rarr;</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-main font-medium">
                          <Video className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>Vídeos de Treino da Faixa</span>
                        </div>
                        <span className="text-[11px] text-gold font-bold">Ver &rarr;</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-main font-medium">
                          <ShoppingBag className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>Loja Oficial da Escola</span>
                        </div>
                        <span className="text-[11px] text-gold font-bold">Acessar &rarr;</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-center gap-1.5 text-[11px] text-muted">
                      <Lock className="w-3.5 h-3.5 text-gold" />
                      <span>Exclusivo para alunos da Núcleo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. DÚVIDAS FREQUENTES (FAQ) ───────────────────────────── */}
        <section className="py-16 sm:py-24 bg-[var(--color-bg-elevated)]">
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
                      <ChevronDown
                        className={`w-5 h-5 text-gold shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
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
      </main>

      {/* ── FOOTER MODERNO COM IMAGEM DE BACKGROUND ── */}
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
                className="!text-neutral-200 hover:!text-amber-400 transition-colors inline-flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 !text-amber-400 shrink-0" />
                <span>
                  <strong className="!text-white">{SCHOOL_ADDRESS}</strong> · {SCHOOL_NEIGHBORHOOD}
                </span>
              </a>

              <a
                href={getWhatsAppUrl('Olá! Vim pelo site da Núcleo de Kung Fu Shaolin.')}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:!text-amber-400 transition-colors font-bold !text-white inline-flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4 !text-amber-400 shrink-0" />
                <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
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
