'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatEmbedUrl } from '@/lib/video-utils'
import {
  createVideoAction,
  updateVideoAction,
  deleteVideoAction,
  type VideoFormData,
} from '@/app/admin/videos/actions'

export interface AdminVideoRecord {
  id: string
  title: string
  category: string
  description: string | null
  video_url: string
  duration_seconds: number | null
  modality_id: string | null
  min_graduation_id: string | null
  created_at: string
  graduation?: {
    id: string
    level_name: string
    level_order: number
    color_hex: string | null
  } | null
}

export interface GraduationItem {
  id: string
  level_name: string
  level_order: number
  color_hex: string | null
  modality_id: string
}

interface AdminVideosManagerProps {
  initialVideos: AdminVideoRecord[]
  graduations: GraduationItem[]
  clfModalityId: string
}

export function AdminVideosManager({
  initialVideos,
  graduations,
  clfModalityId,
}: AdminVideosManagerProps) {
  const [videos, setVideos] = useState<AdminVideoRecord[]>(initialVideos)
  const [search, setSearch] = useState('')
  const [filterBeltId, setFilterBeltId] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Estado do Modal (Criação / Edição)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<AdminVideoRecord | null>(null)

  // Estado do Formulário
  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formGraduationId, setFormGraduationId] = useState(
    graduations[0]?.id || ''
  )
  const [formCategory, setFormCategory] = useState('Básicos')
  const [formDescription, setFormDescription] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Estado de Confirmação de Exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Identifica a graduação selecionada no formulário para ajustar as categorias
  const selectedGraduation = graduations.find((g) => g.id === formGraduationId)
  const isWhiteBelt =
    selectedGraduation?.level_name?.toLowerCase().includes('branca') ||
    selectedGraduation?.level_order === 1

  const availableCategoriesForForm = isWhiteBelt
    ? ['Ataques', 'Bloqueios', 'Defesa Pessoal', 'Básicos']
    : ['Básicos', 'Chutes', 'Aplicações', 'Katis']

  function handleOpenCreateModal() {
    setEditingVideo(null)
    setFormTitle('')
    setFormUrl('')
    const defaultGrad = graduations[0]?.id || ''
    setFormGraduationId(defaultGrad)
    setFormCategory('Ataques')
    setFormDescription('')
    setFormDuration('')
    setFormError(null)
    setIsModalOpen(true)
  }

  function handleOpenEditModal(video: AdminVideoRecord) {
    setEditingVideo(video)
    setFormTitle(video.title)
    setFormUrl(video.video_url)
    setFormGraduationId(video.min_graduation_id || graduations[0]?.id || '')
    setFormCategory(video.category)
    setFormDescription(video.description || '')
    setFormDuration(
      video.duration_seconds ? String(Math.round(video.duration_seconds / 60)) : ''
    )
    setFormError(null)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingVideo(null)
    setFormError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const payload: VideoFormData = {
      title: formTitle,
      videoUrl: formUrl,
      graduationId: formGraduationId,
      category: formCategory,
      description: formDescription,
      durationMinutes: formDuration ? Number(formDuration) : undefined,
      modalityId: clfModalityId,
    }

    startTransition(async () => {
      if (editingVideo) {
        const res = await updateVideoAction(editingVideo.id, payload)
        if (!res.success) {
          setFormError(res.error || 'Erro ao atualizar vídeo')
          return
        }
        setVideos((prev) =>
          prev.map((v) =>
            v.id === editingVideo.id
              ? {
                  ...v,
                  title: payload.title,
                  video_url: formatEmbedUrl(payload.videoUrl),
                  category: payload.category,
                  description: payload.description || null,
                  duration_seconds: payload.durationMinutes
                    ? Math.round(payload.durationMinutes * 60)
                    : null,
                  min_graduation_id: payload.graduationId,
                  graduation: graduations.find((g) => g.id === payload.graduationId) || v.graduation,
                }
              : v
          )
        )
      } else {
        const res = await createVideoAction(payload)
        if (!res.success) {
          setFormError(res.error || 'Erro ao cadastrar vídeo')
          return
        }
        const newRecord: AdminVideoRecord = {
          id: res.videoId || Math.random().toString(),
          title: payload.title,
          video_url: formatEmbedUrl(payload.videoUrl),
          category: payload.category,
          description: payload.description || null,
          duration_seconds: payload.durationMinutes
            ? Math.round(payload.durationMinutes * 60)
            : null,
          modality_id: clfModalityId,
          min_graduation_id: payload.graduationId,
          created_at: new Date().toISOString(),
          graduation: graduations.find((g) => g.id === payload.graduationId) || null,
        }
        setVideos((prev) => [newRecord, ...prev])
      }

      handleCloseModal()
    })
  }

  function handleDelete(videoId: string) {
    startTransition(async () => {
      const res = await deleteVideoAction(videoId)
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v.id !== videoId))
        setDeletingId(null)
      } else {
        alert(res.error || 'Erro ao remover vídeo')
      }
    })
  }

  // Filtragem
  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(search.toLowerCase()))

    const matchesBelt =
      filterBeltId === 'all' || v.min_graduation_id === filterBeltId

    const matchesCategory =
      filterCategory === 'all' || v.category === filterCategory

    return matchesSearch && matchesBelt && matchesCategory
  })

  // Lista única de categorias cadastradas para o filtro
  const allCategories = Array.from(
    new Set([
      'Ataques',
      'Bloqueios',
      'Defesa Pessoal',
      'Básicos',
      'Chutes',
      'Aplicações',
      'Katis',
      ...videos.map((v) => v.category),
    ])
  )

  return (
    <div className="flex flex-col gap-6">
      {/* ── BARRA SUPERIOR DE AÇÕES & NOVO VÍDEO ──────────────────── */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[var(--color-border)] shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥋</span>
            <h2 className="nkfs-h-p font-extrabold text-main">
              Gerenciador de Vídeos de Treino (CLF)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Cadastre os vídeos oficiais de Katis, chutes, aplicações e básicos para visualização dos alunos por faixa.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn btn-gold btn-md font-bold shrink-0 flex items-center gap-2 shadow-sm"
        >
          <span>＋ Cadastrar Novo Vídeo</span>
        </button>
      </div>

      {/* ── BARRA DE FILTROS E BUSCA ──────────────────────────────── */}
      <div className="card p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Campo de Busca */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 text-xs sm:text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">
            🔍
          </span>
        </div>

        {/* Filtro por Faixa */}
        <div className="w-full md:w-56 shrink-0">
          <select
            value={filterBeltId}
            onChange={(e) => setFilterBeltId(e.target.value)}
            className="input w-full text-xs sm:text-sm"
          >
            <option value="all">Todas as Faixas</option>
            {graduations.map((g) => (
              <option key={g.id} value={g.id}>
                {g.level_name} (Nível {g.level_order})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Categoria */}
        <div className="w-full md:w-48 shrink-0">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input w-full text-xs sm:text-sm"
          >
            <option value="all">Todas as Categorias</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── LISTAGEM DE VÍDEOS ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            {filteredVideos.length}{' '}
            {filteredVideos.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
          </span>
          <span className="nkfs-tag-p text-gold">Choy Lay Fut</span>
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => {
              const grad =
                video.graduation ||
                graduations.find((g) => g.id === video.min_graduation_id)

              const embedUrl = formatEmbedUrl(video.video_url)
              const isGoogleDrive = embedUrl.includes('drive.google.com')

              return (
                <div
                  key={video.id}
                  className="card p-0 overflow-hidden flex flex-col justify-between shadow-sm hover:border-[var(--color-gold)] transition-all group"
                >
                  <div>
                    {/* Player Preview */}
                    <div
                      className={`relative bg-black overflow-hidden border-b border-[var(--color-border)] ${
                        isGoogleDrive
                          ? 'aspect-[4/3] sm:aspect-video min-h-[260px]'
                          : 'aspect-video'
                      }`}
                    >
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
                    </div>

                    {/* Metadados */}
                    <div className="p-3.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {grad?.color_hex && (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30"
                              style={{ backgroundColor: grad.color_hex }}
                            />
                          )}
                          <span className="nkfs-tag-p text-gold font-bold">
                            {grad?.level_name || 'Faixa Geral'}
                          </span>
                        </div>

                        <Badge variant="primary">{video.category}</Badge>
                      </div>

                      <h3 className="nkfs-p-m font-bold text-main leading-snug line-clamp-1">
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}

                      {video.duration_seconds && (
                        <span className="text-[11px] text-faint font-mono">
                          ⏱️ {Math.round(video.duration_seconds / 60)} min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(video)}
                      className="btn btn-outline btn-sm text-xs font-semibold px-2.5 py-1"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingId(video.id)}
                      className="btn btn-danger btn-sm text-xs font-semibold px-2.5 py-1"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">🎬</span>
            <p className="nkfs-h-p font-bold text-main">Nenhum vídeo encontrado</p>
            <p className="nkfs-p-p text-muted max-w-md">
              Não há vídeos com os filtros selecionados. Clique em &ldquo;Cadastrar Novo Vídeo&rdquo; para adicionar conteúdo oficial ao portal.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="btn btn-gold btn-md font-bold mt-2"
            >
              ＋ Cadastrar Primeiro Vídeo
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL DE CADASTRO / EDIÇÃO DE VÍDEO ────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="card w-full max-w-lg p-5 sm:p-6 shadow-2xl border-[var(--color-border-gold)] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <h3 className="nkfs-h-p font-extrabold text-main">
                {editingVideo ? 'Editar Vídeo Técnico' : 'Cadastrar Novo Vídeo'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-muted hover:text-main text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="alert alert-error" role="alert">
                  <span>⚠</span>
                  <span className="text-xs sm:text-sm">{formError}</span>
                </div>
              )}

              {/* Título */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">
                  Título do Vídeo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Kati Siu Mui Fa - Execução Completa"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input w-full text-xs sm:text-sm"
                />
              </div>

              {/* URL do Vídeo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">
                  Link do Vídeo (YouTube, Google Drive ou Vimeo) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="Ex: Link do Google Drive ou YouTube..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="input w-full text-xs sm:text-sm"
                />
                <span className="text-[11px] text-faint">
                  💡 O sistema converte automaticamente links do YouTube e do Google Drive para o formato correto de exibição.
                </span>
              </div>

              {/* Faixa Associada */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">
                  Faixa / Graduação Associada *
                </label>
                <select
                  required
                  value={formGraduationId}
                  onChange={(e) => {
                    const newGradId = e.target.value
                    setFormGraduationId(newGradId)
                    const grad = graduations.find((g) => g.id === newGradId)
                    const isWhite =
                      grad?.level_name?.toLowerCase().includes('branca') ||
                      grad?.level_order === 1
                    if (isWhite) {
                      setFormCategory('Ataques')
                    } else if (['Ataques', 'Bloqueios', 'Defesa Pessoal'].includes(formCategory)) {
                      setFormCategory('Básicos')
                    }
                  }}
                  className="input w-full text-xs sm:text-sm font-semibold"
                >
                  {graduations.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.level_name} (Nível {g.level_order})
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria Técnica */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">
                  Categoria Técnica *
                </label>
                <select
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="input w-full text-xs sm:text-sm font-semibold"
                >
                  {availableCategoriesForForm.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-muted">
                  {isWhiteBelt
                    ? 'Faixa Branca: Ataques, Bloqueios, Defesa Pessoal ou Básicos.'
                    : 'Faixas Coloridas: Básicos, Chutes, Aplicações ou Katis.'}
                </span>
              </div>

              {/* Duração em Minutos */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">
                  Duração Estimada (em minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Ex: 8"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="input w-full text-xs sm:text-sm"
                />
              </div>

              {/* Descrição / Dica do Sifu */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase">
                  Descrição / Instrução Técnica do Sifu
                </label>
                <textarea
                  rows={3}
                  placeholder="Destaque pontos importantes: ângulo das mãos, respiração, transições..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input w-full text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)] mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="btn btn-outline btn-md font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-gold btn-md font-bold min-w-32 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Spinner size="sm" />
                      <span>Salvando...</span>
                    </>
                  ) : editingVideo ? (
                    'Salvar Alterações'
                  ) : (
                    'Cadastrar Vídeo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ───────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="card w-full max-w-sm p-5 text-center flex flex-col items-center gap-3 border-red-500/40">
            <span className="text-3xl">⚠️</span>
            <h3 className="nkfs-h-p font-bold text-main">Excluir este vídeo?</h3>
            <p className="text-xs sm:text-sm text-muted">
              Esta ação removerá o vídeo da biblioteca de todos os alunos. Tem certeza que deseja prosseguir?
            </p>

            <div className="flex items-center gap-2 mt-2 w-full">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isPending}
                className="btn btn-outline btn-md flex-1 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
                className="btn btn-danger btn-md flex-1 font-bold flex items-center justify-center gap-1.5"
              >
                {isPending ? <Spinner size="sm" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
