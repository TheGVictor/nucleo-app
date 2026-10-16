'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Announcement } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { parseAnnouncementContent } from '@/lib/announcements'

interface ModalityInfo {
  name?: string
  slug?: string
}

interface EnrichedAnnouncement extends Announcement {
  modality?: ModalityInfo | null
}

const CATEGORY_STYLE: Record<string, 'warning' | 'primary' | 'error' | 'muted' | 'gold'> = {
  Exame:     'warning',
  Seminário: 'primary',
  'Seminário': 'primary',
  Feriado:   'error',
  Aviso:     'muted',
  Evento:    'gold',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function AnnouncementsList({ items }: { items: EnrichedAnnouncement[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [activeItem, setActiveItem] = useState<EnrichedAnnouncement | null>(null)

  const categories = ['Todos', 'Exame', 'Seminário', 'Aviso', 'Feriado', 'Evento']

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'Todos') return true
    return item.category?.toLowerCase() === selectedCategory.toLowerCase()
  })

  if (!items.length) {
    return (
      <div className="empty-state py-6">
        <span className="empty-state-icon">📭</span>
        <p className="nkfs-h-p font-bold text-main">Nenhum comunicado publicado</p>
        <p className="nkfs-p-m text-muted mt-1">
          O mural é atualizado sempre que o Sifu publica novos avisos e cartazes da escola.
        </p>
      </div>
    )
  }

  const activeParsed = activeItem ? parseAnnouncementContent(activeItem.content) : null

  return (
    <div className="flex flex-col gap-3">
      {/* Filtros por categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat
          const count = cat === 'Todos' ? items.length : items.filter(i => i.category?.toLowerCase() === cat.toLowerCase()).length
          if (cat !== 'Todos' && count === 0) return null
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`modality-chip ${isSelected ? 'active' : ''} text-xs py-1 px-2.5`}
            >
              <span>{cat}</span>
              {count > 0 && <span className="opacity-75 font-mono text-[10px]">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Lista de comunicados */}
      <div className="flex flex-col gap-2.5">
        {filteredItems.map(item => {
          const { text, imageUrl } = parseAnnouncementContent(item.content)

          return (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="card-elevated p-4 hover:border-[var(--color-border-gold)] transition-all cursor-pointer group flex flex-col gap-2 shadow-sm"
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveItem(item)
                }
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={CATEGORY_STYLE[item.category] ?? 'muted'}>
                    {item.category}
                  </Badge>
                  {imageUrl && (
                    <Badge variant="gold">🖼️ Cartaz</Badge>
                  )}
                  {item.event_date && (
                    <span className="nkfs-tag-p text-gold font-mono flex items-center gap-1">
                      📅 {new Date(item.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </div>
                <span className="nkfs-tag-p text-faint font-mono">
                  {formatDate(item.created_at)}
                </span>
              </div>

              {/* Título Padronizado */}
              <p className="nkfs-h-p font-bold text-main group-hover:text-gold transition-colors leading-snug">
                {item.title}
              </p>

              {/* Preview de Imagem se houver */}
              {imageUrl && (
                <div className="relative aspect-video w-full rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-black/40 my-1">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
              )}

              {/* Texto Padronizado */}
              {text ? (
                <p className="line-clamp-2 nkfs-p-m text-muted leading-relaxed">
                  {text}
                </p>
              ) : imageUrl ? (
                <p className="nkfs-p-m text-gold italic font-medium">
                  Clique para visualizar o cartaz oficial completo →
                </p>
              ) : null}

              <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)] mt-1">
                <span className="nkfs-tag-p text-faint">
                  {item.modality?.name ? `🥋 ${item.modality.name}` : '🌐 Comunicado Geral'}
                </span>
                <span className="nkfs-tag-p text-gold font-bold group-hover:translate-x-1 transition-transform">
                  Ver detalhes completos →
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── MODAL DE LEITURA DO AVISO ──────────────────────────── */}
      {activeItem && activeParsed && (
        <div className="modal-overlay animate-fade-in" onClick={() => setActiveItem(null)}>
          <div
            className="card w-full max-w-lg p-6 shadow-2xl relative animate-slide-up flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge variant={CATEGORY_STYLE[activeItem.category] ?? 'muted'}>
                    {activeItem.category}
                  </Badge>
                  <span className="nkfs-tag-p text-muted">
                    {activeItem.modality?.name ? `🥋 ${activeItem.modality.name}` : '🌐 Comunicado Geral'}
                  </span>
                  {activeParsed.imageUrl && (
                    <Badge variant="gold">Cartaz Oficial</Badge>
                  )}
                </div>
                <h3 className="nkfs-h-m text-main font-bold leading-snug">
                  {activeItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-muted hover:text-main shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Banner de Data do Evento (se houver) */}
            {activeItem.event_date && (
              <div className="card-gold p-3.5 flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <span className="nkfs-tag-p text-gold uppercase tracking-wider block font-bold">
                    Data Programada
                  </span>
                  <span className="nkfs-p-m font-bold text-main capitalize">
                    {formatFullDate(activeItem.event_date)}
                  </span>
                </div>
              </div>
            )}

            {/* Imagem do Cartaz em Destaque */}
            {activeParsed.imageUrl && (
              <div className="relative w-full rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-black/60 shadow-md">
                <Image
                  src={activeParsed.imageUrl}
                  alt={activeItem.title}
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain max-h-[450px]"
                  unoptimized
                />
              </div>
            )}

            {/* Conteúdo de Texto Padronizado para nkfs-p-m */}
            {activeParsed.text && (
              <div className="text-main nkfs-p-m leading-relaxed whitespace-pre-line py-1">
                {activeParsed.text}
              </div>
            )}

            {/* Rodapé do Modal */}
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="nkfs-tag-p text-faint">
                Publicado em {new Date(activeItem.created_at).toLocaleDateString('pt-BR')}
              </span>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="btn btn-outline btn-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}