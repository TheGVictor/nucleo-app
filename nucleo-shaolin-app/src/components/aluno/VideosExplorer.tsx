'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { formatEmbedUrl, isDirectVideo } from '@/lib/video-utils'

export interface VideoItem {
  id: string
  title: string
  category: 'Ataques' | 'Bloqueios' | 'Defesa Pessoal' | 'Básicos' | 'Chutes' | 'Aplicações' | 'Katis'
  belt: string
  beltOrder: number
  description: string | null
  video_url: string
  duration_seconds?: number | null
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

// ── CATÁLOGO LIMPO DE EXEMPLO (QUANDO O BANCO AINDA NÃO TIVER VÍDEOS) ──
const SAMPLE_VIDEOS: VideoItem[] = [
  // Faixa Branca
  {
    id: 'b-atk-1',
    title: 'Soco Reto Tradicional (Ping Cheun)',
    category: 'Ataques',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 180,
  },
  {
    id: 'b-bloq-1',
    title: 'Bloqueio Superior em Arco (Ding Gwa)',
    category: 'Bloqueios',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 150,
  },
  {
    id: 'b-def-1',
    title: 'Saída de Agarrão de Pulso',
    category: 'Defesa Pessoal',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 210,
  },
  {
    id: 'b-bas-1',
    title: 'Posturas: Sei Ping Ma e Ding Ji Ma',
    category: 'Básicos',
    belt: 'Faixa Branca',
    beltOrder: 1,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 240,
  },

  // Faixa Amarela
  {
    id: 'a-bas-1',
    title: 'Fundamentos de Ging Lik (Chicote)',
    category: 'Básicos',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 180,
  },
  {
    id: 'a-chu-1',
    title: 'Chute Frontal Penetrante (Deng Tui)',
    category: 'Chutes',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 160,
  },
  {
    id: 'a-apl-1',
    title: 'Aplicação de Chape Chui',
    category: 'Aplicações',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 220,
  },
  {
    id: 'a-kat-1',
    title: 'Kati Ng Lun Chuen (Cinco Rodas)',
    category: 'Katis',
    belt: 'Faixa Amarela',
    beltOrder: 2,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 320,
  },

  // Faixa Laranja
  {
    id: 'l-bas-1',
    title: 'Transições em Lok Gwa e Chape',
    category: 'Básicos',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 190,
  },
  {
    id: 'l-chu-1',
    title: 'Chute Varredura Baixa (Sao Tui)',
    category: 'Chutes',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 170,
  },
  {
    id: 'l-apl-1',
    title: 'Combinação Chui + Sow Chui',
    category: 'Aplicações',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 230,
  },
  {
    id: 'l-kat-1',
    title: 'Kati Siu Mui Fa (Flor de Ameixeira)',
    category: 'Katis',
    belt: 'Faixa Laranja',
    beltOrder: 3,
    description: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration_seconds: 350,
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
  // Identifica a graduação do aluno
  const studentBeltObj =
    BELT_HIERARCHY.find((b) => b.name.toLowerCase() === studentCurrentBelt.toLowerCase()) ||
    BELT_HIERARCHY[2] // Padrão: Faixa Laranja

  const isWhiteBelt = studentBeltObj.order === 1

  // ── CATEGORIAS POR FAIXA (DIRETRIZ DA ESCOLA) ──────────────────
  // Branca: Ataques, Bloqueios, Defesa Pessoal, Básicos
  // Coloridas: Básicos, Chutes, Aplicações, Katis
  const categories = isWhiteBelt
    ? (['Ataques', 'Bloqueios', 'Defesa Pessoal', 'Básicos'] as const)
    : (['Básicos', 'Chutes', 'Aplicações', 'Katis'] as const)

  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0])
  const [selectedKatiBelt, setSelectedKatiBelt] = useState<string>('all')

  const activeCategory = categories.includes(selectedCategory as any)
    ? selectedCategory
    : categories[0]

  // Usa vídeos do banco se existirem, senão usa catálogo limpo de amostra
  const allVideos = initialVideos.length > 0 ? initialVideos : SAMPLE_VIDEOS

  // ── FILTRAGEM RIGOROSA ─────────────────────────────────────────
  // 1. Se for Katis: mostra katis da faixa do aluno E de todas as faixas anteriores conquistadas (order >= 2 e <= studentBeltObj.order)
  // 2. Se for outra categoria: mostra estritamente da faixa atual do aluno
  const filteredVideos = allVideos.filter((v) => {
    if (isWhiteBelt) {
      return v.beltOrder === 1 && v.category === activeCategory
    }

    if (activeCategory === 'Katis') {
      if (v.category !== 'Katis') return false
      if (v.beltOrder > studentBeltObj.order) return false
      if (selectedKatiBelt !== 'all' && v.belt !== selectedKatiBelt) return false
      return true
    }

    return v.category === activeCategory && v.beltOrder === studentBeltObj.order
  })

  // Lista de faixas disponíveis para filtro na aba Katis
  const availableKatiBelts = BELT_HIERARCHY.filter(
    (b) => b.order >= 2 && b.order <= studentBeltObj.order
  )

  return (
    <div className="flex flex-col gap-5">
      {/* ── BARRA DE FILTROS MINIMALISTA (CHIPS COMPACTOS) ─────────── */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat)
                  setSelectedKatiBelt('all')
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-bold shadow-xs'
                    : 'bg-[var(--color-bg-card)] text-muted hover:text-main hover:bg-[var(--color-bg-elevated)] border-[var(--color-border)]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Sub-filtro de faixas quando Katis estiver ativo e o aluno tiver mais de 1 faixa com Kati */}
        {activeCategory === 'Katis' && availableKatiBelts.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pl-0.5">
            <span className="text-[11px] font-bold text-muted uppercase mr-1 shrink-0">
              Faixa:
            </span>
            <button
              type="button"
              onClick={() => setSelectedKatiBelt('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedKatiBelt === 'all'
                  ? 'bg-[var(--color-gold)] text-black font-bold'
                  : 'bg-[var(--color-bg-elevated)] text-muted hover:text-main border border-[var(--color-border)]'
              }`}
            >
              Todas
            </button>
            {availableKatiBelts.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedKatiBelt(b.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedKatiBelt === b.name
                    ? 'bg-[var(--color-gold)] text-black font-bold'
                    : 'bg-[var(--color-bg-elevated)] text-muted hover:text-main border border-[var(--color-border)]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: b.color }}
                />
                <span>{b.name.replace('Faixa ', '')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── GRADE LIMPA DE VÍDEOS ──────────────────────────────────── */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.map((video) => (
            <CleanVideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center flex flex-col items-center gap-1.5 text-muted">
          <span className="text-3xl">🎬</span>
          <p className="text-sm font-semibold text-main">
            Nenhum vídeo em &ldquo;{activeCategory}&rdquo; no momento
          </p>
          <p className="text-xs max-w-xs">
            Novos materiais técnicos serão publicados aqui pelos instrutores.
          </p>
        </div>
      )}
    </div>
  )
}

function CleanVideoCard({ video }: { video: VideoItem }) {
  const embedUrl = formatEmbedUrl(video.video_url)
  const isDirect = isDirectVideo(embedUrl)
  const isGoogleDrive = !isDirect && embedUrl.includes('drive.google.com')

  return (
    <div className="card p-0 overflow-hidden shadow-sm flex flex-col justify-between border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all">
      {/* Player de Vídeo Responsivo */}
      <div
        className={`relative bg-black overflow-hidden border-b border-[var(--color-border)] ${
          isGoogleDrive
            ? 'aspect-[4/3] sm:aspect-video min-h-[260px]'
            : 'aspect-video'
        }`}
      >
        {isDirect ? (
          <video
            src={embedUrl}
            controls
            controlsList="nodownload"
            playsInline
            className="w-full h-full object-contain bg-black"
            preload="metadata"
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <iframe
            src={embedUrl}
            className={`w-full ${
              isGoogleDrive
                ? 'h-[calc(100%+48px)] -mt-[48px]'
                : 'h-full'
            }`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={video.title}
            loading="lazy"
          />
        )}
      </div>

      {/* Título e Metadados Essenciais (Sem poluição) */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-main leading-snug truncate">
            {video.title}
          </h3>
          <span className="text-xs text-muted font-medium mt-0.5 block">
            {video.belt} · {video.category}
          </span>
        </div>

        {video.duration_seconds && (
          <span className="text-xs text-faint font-mono shrink-0">
            ⏱️ {Math.round(video.duration_seconds / 60)} min
          </span>
        )}
      </div>
    </div>
  )
}
