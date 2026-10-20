'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

export interface VideoItem {
  id: string
  title: string
  category: string
  description: string | null
  video_url: string
  duration_seconds?: number | null
  modality: { name: string } | null
}

export function VideosExplorer({ initialVideos }: { initialVideos: VideoItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')

  // Categorias únicas dos vídeos
  const categories = ['Todos', ...Array.from(new Set(initialVideos.map(v => v.category).filter(Boolean)))]

  const filtered = initialVideos.filter(v => {
    return selectedCategory === 'Todos' || v.category === selectedCategory
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Filtro por Categoria */}
      <div className="card p-2.5 sm:p-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`modality-chip ${isSelected ? 'active' : ''} text-xs py-1.5 px-3 shrink-0`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Dica Pedagógica do Sifu */}
      <div className="card-elevated p-3.5 flex items-center gap-3 border-l-3 border-[var(--color-primary)]">
        <span className="text-2xl shrink-0">💡</span>
        <p className="nkfs-p-m text-muted leading-relaxed">
          <strong>Instrução do Sifu:</strong> Pratique cada movimento lentamente antes de acelerar. A precisão dos ângulos e a respiração diafragmática vêm antes da velocidade.
        </p>
      </div>

      {/* Lista de Vídeos */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="card p-0 overflow-hidden shadow-lg flex flex-col justify-between group hover:border-[var(--color-border-gold)] transition-all">
              <div>
                <div className="aspect-video bg-black/80 relative border-b border-[var(--color-border)]">
                  <iframe
                    src={v.video_url}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={v.title}
                  />
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold">
                        {v.modality?.name ?? 'Shaolin'}
                      </Badge>
                      <span className="nkfs-tag-p text-muted uppercase">
                        {v.category}
                      </span>
                    </div>
                    {v.duration_seconds && (
                      <span className="nkfs-tag-p text-faint font-mono">
                        ⏱️ {Math.round(v.duration_seconds / 60)} min
                      </span>
                    )}
                  </div>

                  <h3 className="nkfs-p-m font-bold text-main mt-1 leading-snug">
                    {v.title}
                  </h3>

                  {v.description && (
                    <p className="nkfs-p-m text-muted line-clamp-2 leading-relaxed mt-0.5">
                      {v.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-4 pb-3.5 pt-1 text-right">
                <span className="nkfs-tag-p text-gold font-bold">
                  Material Oficial Homologado ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center flex flex-col items-center">
          <span className="text-4xl mb-2">🥋</span>
          <p className="nkfs-p-m font-bold text-main">
            Nenhum vídeo encontrado
          </p>
          <p className="nkfs-p-p text-muted mt-1 max-w-sm">
            {selectedCategory !== 'Todos'
              ? 'Tente selecionar outra categoria de treino.'
              : 'Os vídeos gravados pelo Sifu Guilherme para o seu nível técnico serão liberados aqui.'}
          </p>
        </div>
      )}
    </div>
  )
}
