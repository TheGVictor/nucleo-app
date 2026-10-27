'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

export interface VideoItem {
  id: string
  title: string
  category: 'Ataques' | 'Bloqueios' | 'Defesa Pessoal' | 'Básicos' | 'Chutes' | 'Aplicações' | 'Katis'
  belt: string // ex: 'Faixa Branca', 'Faixa Amarela', 'Faixa Laranja', etc.
  beltOrder: number
  description: string | null
  video_url: string
  duration_seconds?: number | null
  katiName?: string | null
}

export interface BeltOption {
  id: string
  name: string
  order: number
  color: string
}

export const BELT_HIERARCHY: BeltOption[] = [
  { id: 'branca', name: 'Faixa Branca', order: 1, color: '#E2E8F0' },
  { id: 'amarela', name: 'Faixa Amarela', order: 2, color: '#FFD700' },
  { id: 'laranja', name: 'Faixa Laranja', order: 3, color: '#FF8C00' },
  { id: 'verde-jade', name: 'Faixa Verde-Jade', order: 4, color: '#00A86B' },
  { id: 'verde-escura', name: 'Faixa Verde Escura', order: 5, color: '#006400' },
  { id: 'roxa', name: 'Faixa Roxa', order: 6, color: '#800080' },
  { id: 'vermelha', name: 'Faixa Vermelha', order: 7, color: '#DC143C' },
  { id: 'marrom-clara', name: 'Faixa Marrom-Clara', order: 8, color: '#C4A35A' },
  { id: 'marrom-avancada', name: 'Faixa Marrom-Avançada', order: 9, color: '#8B4513' },
  { id: 'preta', name: 'Faixa Preta', order: 10, color: '#1A1A1A' },
]

// ── VÍDEOS DE DEMONSTRAÇÃO ALINHADOS ÀS DIRETRIZES DO SIFU ───────
const SAMPLE_VIDEOS: VideoItem[] = [
  // ── FAIXA BRANCA ──────────────────────────────────────────────
  {
    id: 'b-atk-1',
    title: 'Soco Reto Tradicional (Ping Cheun)',
    category: 'Ataques',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: 'Transferência de força pelo quadril, alinhamento dos nós dos dedos e fechamento correto do punho.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 320,
  },
  {
    id: 'b-atk-2',
    title: 'Soco Circular de Potência (Tsop Cheun)',
    category: 'Ataques',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: 'Mecânica do braço chicote com cobertura simultânea do queixo e tronco.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 280,
  },
  {
    id: 'b-bloq-1',
    title: 'Bloqueio Superior em Arco (Ding Gwa)',
    category: 'Bloqueios',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: 'Defesa e desvio de ataques descendentes na cabeça sem perder a visão frontal.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 240,
  },
  {
    id: 'b-bloq-2',
    title: 'Bloqueio Cruzado Médio (Pak Sao)',
    category: 'Bloqueios',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: 'Desvio suave da linha central com palma firme para abertura de contra-golpe.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 210,
  },
  {
    id: 'b-def-1',
    title: 'Liberação de Agarrão Duplo de Pulso',
    category: 'Defesa Pessoal',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: 'Alavanca angular clássica utilizando o ponto fraco entre o polegar e os dedos do agressor.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 350,
  },
  {
    id: 'b-def-2',
    title: 'Defesa contra Pegada de Gola e Empurrão',
    category: 'Defesa Pessoal',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: 'Esquiva rápida com rotação de ombro e desarme de base do adversário.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 390,
  },
  {
    id: 'b-bas-1',
    title: 'Posturas Fundamentais: Cavalo (Sei Ping Ma) e Arco (Ding Ji Ma)',
    category: 'Básicos',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: 'Enraizamento de sola, ângulo dos joelhos e estabilidade de coluna lombar.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 460,
  },

  // ── FAIXA AMARELA ─────────────────────────────────────────────
  {
    id: 'a-bas-1',
    title: 'Fundamentos de Ging Lik (Força Elástica e Chicote)',
    category: 'Básicos',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    description: 'Relaxamento muscular seguido de contração explosiva no impacto final.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 310,
  },
  {
    id: 'a-chu-1',
    title: 'Chute Frontal Penetrante (Deng Tui)',
    category: 'Chutes',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    description: 'Elevação do joelho antes da extensão, golpeando com a sola ou calcanhar.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 270,
  },
  {
    id: 'a-apl-1',
    title: 'Aplicação de Chape Chui em Contra-Ataque',
    category: 'Aplicações',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    description: 'Passada diagonal de esquiva com penetração de soco perfurante de leopardo.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 380,
  },
  {
    id: 'a-kat-1',
    title: 'Kati Ng Lun Chuen (Cinco Rodas) — Execução Completa',
    category: 'Katis',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    katiName: 'Ng Lun Chuen (五輪拳)',
    description: 'A primeira forma canônica do Choy Lay Fut. Foco em equilíbrio, transições limpas e ritmo constante.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 520,
  },
  {
    id: 'a-kat-2',
    title: 'Kati Ng Lun Chuen — Desmembramento Técnico Passo a Passo',
    category: 'Katis',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    katiName: 'Ng Lun Chuen (五輪拳)',
    description: 'Explicação detalhada dos ângulos das mãos e respiração durante a sequência das Cinco Rodas.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 640,
  },

  // ── FAIXA LARANJA ─────────────────────────────────────────────
  {
    id: 'l-bas-1',
    title: 'Muvimentação Rápida em Lok Gwa e Chape',
    category: 'Básicos',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    description: 'Coordenação rítmica entre mãos altas e passos laterais com base firme.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 360,
  },
  {
    id: 'l-chu-1',
    title: 'Chute Circular Varredura Baixa (Sao Tui)',
    category: 'Chutes',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    description: 'Rotação sobre o pé de apoio e impacto no terço inferior da tíbia com recuperação instantânea.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 290,
  },
  {
    id: 'l-apl-1',
    title: 'Combinação Chui + Sow Chui com Projeção Suave',
    category: 'Aplicações',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    description: 'Quebra de guarda frontal com soco martelo e desarme do equilíbrio do adversário.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 410,
  },
  {
    id: 'l-kat-1',
    title: 'Kati Siu Mui Fa (Pequena Flor de Ameixeira) — Forma Oficial',
    category: 'Katis',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    katiName: 'Siu Mui Fa (小梅花拳)',
    description: 'Forma clássica caracterizada por giros velozes, ataques multidirecionais e passos em flor de ameixeira.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 590,
  },
  {
    id: 'l-kat-2',
    title: 'Kati Siu Mui Fa — Aplicações Marciais Ocultas (Bunkai)',
    category: 'Katis',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    katiName: 'Siu Mui Fa (小梅花拳)',
    description: 'O Sifu demonstra a aplicação de cada movimento do Kati em situação de combate real.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 680,
  },

  // ── FAIXA VERDE-JADE ──────────────────────────────────────────
  {
    id: 'v-bas-1',
    title: 'Transições Avançadas de Base: Ding Ji para Lau Sing Ma',
    category: 'Básicos',
    belt: 'Faixa Verde-Jade',
    beltOrder: 4,
    description: 'Velocidade de troca de peso sem alterar a altura do quadril.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 340,
  },
  {
    id: 'v-chu-1',
    title: 'Chute Lateral Perfurante com Salto (Dang Tui)',
    category: 'Chutes',
    belt: 'Faixa Verde-Jade',
    beltOrder: 4,
    description: 'Impulsão explosiva e precisão de impacto com a borda externa do pé.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 330,
  },
  {
    id: 'v-apl-1',
    title: 'Aplicações de Defesa contra Golpes com Armas Curtas',
    category: 'Aplicações',
    belt: 'Faixa Verde-Jade',
    beltOrder: 4,
    description: 'Controle de punho, trava articular e desvio seguro da trajetória.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 450,
  },
  {
    id: 'v-kat-1',
    title: 'Kati Sup Ji Kau Da Chuen (Forma da Cruz)',
    category: 'Katis',
    belt: 'Faixa Verde-Jade',
    beltOrder: 4,
    katiName: 'Sup Ji Kau Da Chuen (十字扣打拳)',
    description: 'Sequência dinâmica de ataques em cruz e combate contínuo com múltiplos atacantes.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 620,
  },
]

interface VideosExplorerProps {
  initialVideos?: VideoItem[]
  studentCurrentBelt?: string
}

export function VideosExplorer({
  initialVideos = [],
  studentCurrentBelt = 'Faixa Laranja',
}: VideosExplorerProps) {
  // Permite selecionar/simular a graduação para visualizar o comportamento exato
  const [activeBeltName, setActiveBeltName] = useState<string>(studentCurrentBelt)

  // Encontra o objeto da faixa selecionada
  const activeBelt =
    BELT_HIERARCHY.find((b) => b.name.toLowerCase() === activeBeltName.toLowerCase()) ||
    BELT_HIERARCHY[2] // Padrão: Laranja (order 3)

  const isWhiteBelt = activeBelt.order === 1

  // ── CATEGORIAS DETERMINADAS PELO SISTEMA MARCIAL ───────────────
  // Faixa Branca: Ataques, Bloqueios, Defesa Pessoal, Básicos (Sem Katis)
  // Faixas Coloridas (Amarela+): Básicos, Chutes, Aplicações, Katis (com histórico)
  const availableCategories = isWhiteBelt
    ? (['Ataques', 'Bloqueios', 'Defesa Pessoal', 'Básicos'] as const)
    : (['Básicos', 'Chutes', 'Aplicações', 'Katis'] as const)

  const [selectedCategory, setSelectedCategory] = useState<string>(
    isWhiteBelt ? 'Ataques' : 'Básicos'
  )

  // Se a faixa mudar e a categoria selecionada não existir mais, ajusta automaticamente
  const currentCategory = availableCategories.includes(selectedCategory as any)
    ? selectedCategory
    : availableCategories[0]

  // Combina vídeos do banco com os exemplos didáticos se o banco ainda não tiver dados suficientes
  const allVideos = initialVideos.length > 0 ? initialVideos : SAMPLE_VIDEOS

  // ── REGRAS DE VISIBILIDADE DOS VÍDEOS ─────────────────────────
  // 1. Se for categoria diferente de 'Katis':
  //    O aluno vê apenas o conteúdo correspondente à sua faixa atual!
  // 2. Se for 'Katis':
  //    O aluno vê os Katis da faixa dele E de todas as faixas anteriores já conquistadas!
  const filteredVideos = allVideos.filter((v) => {
    if (isWhiteBelt) {
      // Faixa Branca: vídeos de Faixa Branca da categoria selecionada
      return v.beltOrder === 1 && v.category === currentCategory
    }

    if (currentCategory === 'Katis') {
      // Vê Katis da sua faixa e de todas as faixas anteriores (order <= activeBelt.order)
      return v.category === 'Katis' && v.beltOrder <= activeBelt.order
    }

    // Básicos, Chutes, Aplicações: vê estritamente da sua faixa atual
    return v.category === currentCategory && v.beltOrder === activeBelt.order
  })

  // Agrupamento de Katis por faixa conquistada (quando a categoria for 'Katis')
  const katisByBelt =
    currentCategory === 'Katis'
      ? BELT_HIERARCHY.filter((b) => b.order >= 2 && b.order <= activeBelt.order).map(
          (belt) => ({
            belt,
            videos: filteredVideos.filter((v) => v.beltOrder === belt.order),
          })
        )
      : []

  return (
    <div className="flex flex-col gap-6">
      {/* ── BARRA DE SELEÇÃO / SIMULAÇÃO DE FAIXA (PEDAGÓGICA) ──────── */}
      <div className="card p-4 flex flex-col gap-3 border-[var(--color-border-gold)]/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥋</span>
            <div>
              <span className="nkfs-tag-p text-gold block">
                Visualização por Graduação do Aluno
              </span>
              <span className="nkfs-p-m font-bold text-main">
                {activeBelt.name} (Nível {activeBelt.order} de {BELT_HIERARCHY.length})
              </span>
            </div>
          </div>

          <span className="nkfs-tag-p text-muted">
            {isWhiteBelt
              ? 'Apostila Básica Inicial (Sem Katis)'
              : `Acesso a Katis da ${activeBelt.name} e anteriores`}
          </span>
        </div>

        {/* Chips de troca rápida de faixa para teste imediato */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {BELT_HIERARCHY.map((b) => {
            const isCurrent = b.order === activeBelt.order
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setActiveBeltName(b.name)
                  // Ao alternar para branca ou vice-versa, reseta para a primeira categoria válida
                  if (b.order === 1) setSelectedCategory('Ataques')
                  else if (activeBelt.order === 1) setSelectedCategory('Básicos')
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  isCurrent
                    ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] shadow-xs font-extrabold scale-102'
                    : 'bg-[var(--color-bg-elevated)] text-muted hover:text-main hover:bg-white/5 border-[var(--color-border)]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30"
                  style={{ backgroundColor: b.color }}
                />
                <span>{b.name.replace('Faixa ', '')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── BARRA DE NAVEGAÇÃO DE CATEGORIAS ───────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="nkfs-tag-p text-muted uppercase tracking-wider">
          {isWhiteBelt
            ? 'Conteúdos da Faixa Branca:'
            : `Módulos Técnicos da ${activeBelt.name}:`}
        </span>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {availableCategories.map((cat) => {
            const isSelected = currentCategory === cat
            const icon =
              cat === 'Ataques'
                ? '👊'
                : cat === 'Bloqueios'
                ? '🛡️'
                : cat === 'Defesa Pessoal'
                ? '🥋'
                : cat === 'Básicos'
                ? '⚡'
                : cat === 'Chutes'
                ? '🦵'
                : cat === 'Aplicações'
                ? '🥊'
                : '📜'

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border shadow-xs ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-extrabold shadow-md'
                    : 'bg-[var(--color-bg-card)] text-muted hover:text-main hover:bg-[var(--color-bg-elevated)] border-[var(--color-border)]'
                }`}
              >
                <span className="text-base">{icon}</span>
                <span>{cat}</span>
                {cat === 'Katis' && (
                  <span className="text-[10px] bg-black/20 text-white/90 px-1.5 py-0.5 rounded-full font-mono">
                    Faixas 2-{activeBelt.order}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── DICA PEDAGÓGICA DO SIFU ───────────────────────────────── */}
      <div className="card-elevated p-4 flex items-start gap-3 border-l-3 border-[var(--color-gold)]">
        <span className="text-2xl shrink-0 mt-0.5">⛩️</span>
        <div className="flex flex-col gap-0.5 text-xs sm:text-sm">
          <strong className="text-gold font-bold">
            {currentCategory === 'Katis'
              ? 'Instrução do Sifu para o Estudo dos Katis:'
              : isWhiteBelt
              ? 'Fundamentos Iniciais do Kung Fu Shaolin:'
              : `Aperfeiçoamento Técnico — ${currentCategory}:`}
          </strong>
          <p className="text-muted leading-relaxed">
            {currentCategory === 'Katis'
              ? 'Nunca abandone os Katis das faixas anteriores. Um bom praticante de Kung Fu mantém as formas clássicas polidas e fluidas ao longo de toda a vida marcial.'
              : isWhiteBelt
              ? 'Na Faixa Branca construímos a raiz. Ataques, bloqueios e posturas firmes são a base inegociável antes de aprender formas longas.'
              : `Pratique as repetições de ${currentCategory.toLowerCase()} com velocidade controlada. A força real vem do alinhamento biomecânico e da respiração diafragmática.`}
          </p>
        </div>
      </div>

      {/* ── EXIBIÇÃO DE VÍDEOS: MODO KATIS (AGRUPADO POR FAIXA) ─────── */}
      {currentCategory === 'Katis' ? (
        <div className="flex flex-col gap-8">
          {katisByBelt.map(({ belt, videos }) => (
            <div key={belt.id} className="flex flex-col gap-3">
              {/* Cabeçalho da Faixa do Kati */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/30 shadow-xs"
                    style={{ backgroundColor: belt.color }}
                  />
                  <h3 className="nkfs-h-p font-extrabold text-main">
                    Katis da {belt.name}
                  </h3>
                  {belt.order === activeBelt.order && (
                    <Badge variant="gold">Faixa Atual</Badge>
                  )}
                  {belt.order < activeBelt.order && (
                    <Badge variant="muted">Faixa Anterior Homologada</Badge>
                  )}
                </div>

                <span className="text-xs text-muted font-mono">
                  {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
                </span>
              </div>

              {/* Grid de vídeos dessa faixa */}
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((v) => (
                    <VideoCard key={v.id} video={v} />
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-center text-muted text-xs">
                  Nenhum vídeo de Kati cadastrado para a {belt.name}.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── EXIBIÇÃO DE VÍDEOS: DEMAIS CATEGORIAS (GRADE PADRÃO) ─── */
        <div>
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center flex flex-col items-center gap-2">
              <span className="text-3xl">🥋</span>
              <p className="nkfs-p-m font-bold text-main">
                Nenhum vídeo em &ldquo;{currentCategory}&rdquo; para a {activeBelt.name}
              </p>
              <p className="nkfs-p-p text-muted max-w-sm">
                Novos vídeos técnicos oficiais serão adicionados pelo Sifu e pela equipe técnica em breve.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <div className="card p-0 overflow-hidden shadow-lg flex flex-col justify-between group hover:border-[var(--color-border-gold)] transition-all">
      <div>
        {/* Player de Vídeo Responsivo */}
        <div className="aspect-video bg-black/90 relative border-b border-[var(--color-border)]">
          <iframe
            src={video.video_url}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        {/* Informações e Metadados do Vídeo */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{video.belt}</Badge>
              <span className="nkfs-tag-p text-muted uppercase">
                {video.category}
              </span>
            </div>

            {video.duration_seconds && (
              <span className="nkfs-tag-p text-faint font-mono">
                ⏱️ {Math.round(video.duration_seconds / 60)} min
              </span>
            )}
          </div>

          <h4 className="nkfs-p-m font-bold text-main leading-snug">
            {video.title}
          </h4>

          {video.description && (
            <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 pt-1 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-muted">
        <span className="text-gold font-bold nkfs-tag-p">
          ✓ Homologado Sifu Guilherme
        </span>
        <span className="text-faint nkfs-tag-p">Choy Lay Fut Tradicional</span>
      </div>
    </div>
  )
}
