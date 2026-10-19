'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { parseAnnouncementContent } from '@/lib/announcements'
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  uploadAnnouncementImageAction,
  type AnnouncementWithModality,
} from '@/app/admin/announcements/actions'

interface ModalityOption {
  id: string
  name: string
  slug: string
}

export interface StudentOption {
  id: string
  full_name: string
  modality_name?: string
  graduation_name?: string
}

interface AnnouncementsManagerProps {
  initialAnnouncements: AnnouncementWithModality[]
  modalities: ModalityOption[]
  students?: StudentOption[]
}

const CATEGORIES = ['Aviso', 'Exame', 'Seminário', 'Feriado', 'Evento']

const CATEGORY_BADGE: Record<string, 'muted' | 'warning' | 'primary' | 'error' | 'gold'> = {
  Aviso: 'muted',
  Exame: 'warning',
  Seminário: 'primary',
  Feriado: 'error',
  Evento: 'gold',
}

export function AnnouncementsManager({
  initialAnnouncements,
  modalities,
  students = [],
}: AnnouncementsManagerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementWithModality[]>(initialAnnouncements)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')

  // Estado do Modal (criar ou editar)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AnnouncementWithModality | null>(null)

  // Modo de conteúdo: 'text' (só texto), 'image' (apenas imagem ao invés de descrição), 'both' (ambos)
  const [contentMode, setContentMode] = useState<'text' | 'image' | 'both'>('text')

  // Destinatários: 'all' (Geral), 'modality' (Por Modalidade), 'group' (Grupo de Alunos)
  const [audienceType, setAudienceType] = useState<'all' | 'modality' | 'group'>('all')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')

  // Formulário
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formCategory, setFormCategory] = useState('Aviso')
  const [formEventDate, setFormEventDate] = useState('')
  const [formModalityId, setFormModalityId] = useState('')

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function openCreateModal() {
    setEditingItem(null)
    setFormTitle('')
    setFormContent('')
    setFormImageUrl('')
    setContentMode('text')
    setAudienceType('all')
    setSelectedStudentIds([])
    setStudentSearch('')
    setFormCategory('Aviso')
    setFormEventDate('')
    setFormModalityId('')
    setErrorMessage(null)
    setIsModalOpen(true)
  }

  function openEditModal(item: AnnouncementWithModality) {
    setEditingItem(item)
    const { text, imageUrl, targetStudentIds } = parseAnnouncementContent(item.content)

    setFormTitle(item.title)
    setFormContent(text)
    setFormImageUrl(imageUrl || '')
    setFormCategory(item.category || 'Aviso')
    setFormEventDate(item.event_date ? item.event_date.slice(0, 10) : '')

    if (targetStudentIds && targetStudentIds.length > 0) {
      setAudienceType('group')
      setSelectedStudentIds(targetStudentIds)
      setFormModalityId('')
    } else if (item.modality_id) {
      setAudienceType('modality')
      setFormModalityId(item.modality_id)
      setSelectedStudentIds([])
    } else {
      setAudienceType('all')
      setFormModalityId('')
      setSelectedStudentIds([])
    }

    setStudentSearch('')

    if (imageUrl && !text) {
      setContentMode('image')
    } else if (imageUrl && text) {
      setContentMode('both')
    } else {
      setContentMode('text')
    }

    setErrorMessage(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingItem(null)
    setErrorMessage(null)
  }

  // Helpers para multi-seleção de alunos
  const filteredStudents = (students || []).filter((s) => {
    if (!studentSearch.trim()) return true
    const q = studentSearch.toLowerCase()
    return (
      s.full_name.toLowerCase().includes(q) ||
      (s.modality_name && s.modality_name.toLowerCase().includes(q)) ||
      (s.graduation_name && s.graduation_name.toLowerCase().includes(q))
    )
  })

  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function selectAllFilteredStudents() {
    const visibleIds = filteredStudents.map((s) => s.id)
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
  }

  function clearSelectedStudents() {
    setSelectedStudentIds([])
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await uploadAnnouncementImageAction(formData)
    setIsUploading(false)

    if (res.success && res.url) {
      setFormImageUrl(res.url)
    } else {
      setErrorMessage(res.error || 'Falha ao fazer upload da imagem.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      let targetStudentIds: string[] | undefined = undefined
      let targetStudentNames: string[] | undefined = undefined
      let modalityIdToSave: string | null = null

      if (audienceType === 'group') {
        if (selectedStudentIds.length === 0) {
          setErrorMessage('Selecione ao menos 1 aluno para enviar este comunicado ao grupo.')
          setIsSubmitting(false)
          return
        }
        targetStudentIds = selectedStudentIds
        targetStudentNames = selectedStudentIds.map(
          (id) => students.find((s) => s.id === id)?.full_name || id
        )
      } else if (audienceType === 'modality') {
        if (!formModalityId) {
          setErrorMessage('Selecione a modalidade de destino para o comunicado.')
          setIsSubmitting(false)
          return
        }
        modalityIdToSave = formModalityId
      }

      const payload = {
        title: formTitle,
        content: contentMode === 'image' ? '' : formContent,
        image_url: contentMode === 'text' ? null : formImageUrl,
        category: formCategory,
        event_date: formEventDate || null,
        modality_id: modalityIdToSave,
        target_student_ids: targetStudentIds,
        target_student_names: targetStudentNames,
      }

      if (editingItem) {
        // Atualizar
        const res = await updateAnnouncementAction(editingItem.id, payload)
        if (res.success && res.announcement) {
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === editingItem.id ? res.announcement : a))
          )
          setSuccessMessage('Aviso atualizado com sucesso!')
        }
      } else {
        // Criar
        const res = await createAnnouncementAction(payload)
        if (res.success && res.announcement) {
          setAnnouncements((prev) => [res.announcement, ...prev])
          setSuccessMessage('Novo aviso publicado com sucesso!')
        }
      }

      closeModal()
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Ocorreu um erro ao salvar o aviso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este aviso? Essa ação é definitiva.')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteAnnouncementAction(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      setSuccessMessage('Aviso removido com sucesso.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao excluir o aviso.')
    } finally {
      setDeletingId(null)
    }
  }

  // Filtragem
  const filtered = announcements.filter(item => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory
    const q = search.toLowerCase()
    const { text } = parseAnnouncementContent(item.content)
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(q) ||
      text.toLowerCase().includes(q) ||
      (item.modality?.name && item.modality.name.toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  })

  return (
    <section className="flex flex-col gap-4">
      {/* Header do Gerenciador de Avisos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="nkfs-h-p text-main font-bold">
              Gestão de Avisos & Comunicados
            </h2>
            <Badge variant="gold">{announcements.length} {announcements.length === 1 ? 'aviso' : 'avisos'}</Badge>
          </div>
          <p className="nkfs-p-m text-muted mt-0.5">
            Publique comunicados em texto ou em formato de imagem/cartaz oficial para os alunos.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-gold btn-sm self-start sm:self-auto shadow-md"
        >
          + Novo Aviso
        </button>
      </div>

      {/* Feedback de Sucesso */}
      {successMessage && (
        <div className="alert alert-success animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span className="nkfs-p-m font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-muted hover:text-main text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="card p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Chips de Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {['Todos', ...CATEGORIES].map(cat => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`modality-chip ${isSelected ? 'active' : ''} text-xs py-1.5 px-3`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Campo de Busca */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar comunicado..."
            className="input text-sm py-1.5 px-3"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Lista de Avisos */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => {
            const { text, imageUrl, targetStudentIds, targetStudentNames } = parseAnnouncementContent(item.content)
            const isTargetedGroup = Boolean(targetStudentIds && targetStudentIds.length > 0)

            return (
              <div
                key={item.id}
                className="card-elevated p-4 flex flex-col justify-between hover:border-[var(--color-border-gold)] transition-all group"
              >
                <div>
                  {/* Metadados: Categoria, Modalidade/Grupo e Data do Evento */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={CATEGORY_BADGE[item.category] ?? 'muted'}>
                        {item.category}
                      </Badge>
                      {isTargetedGroup ? (
                        <Badge variant="gold">
                          👥 Grupo ({targetStudentIds?.length} {targetStudentIds?.length === 1 ? 'aluno' : 'alunos'})
                        </Badge>
                      ) : item.modality?.name ? (
                        <span className="nkfs-tag-p text-muted">
                          🥋 {item.modality.name}
                        </span>
                      ) : (
                        <span className="nkfs-tag-p text-muted">
                          🌐 Geral
                        </span>
                      )}
                      {imageUrl && (
                        <Badge variant="gold">🖼️ Cartaz</Badge>
                      )}
                    </div>

                    <span className="nkfs-tag-p text-faint font-mono">
                      {new Date(item.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  {/* Título Padronizado */}
                  <h3 className="nkfs-h-p text-main font-bold leading-snug">
                    {item.title}
                  </h3>

                  {/* Nomes dos Alunos Destinatários do Grupo */}
                  {isTargetedGroup && targetStudentNames && targetStudentNames.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap my-2 p-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-muted">
                      <span className="font-semibold text-main">🎯 Destinado a:</span>
                      <span className="line-clamp-2">
                        {targetStudentNames.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Data do Evento (se houver) */}
                  {item.event_date && (
                    <div className="inline-flex items-center gap-1.5 my-2 px-2.5 py-1 rounded bg-[var(--color-gold-muted)] border border-[var(--color-border-gold)] text-gold nkfs-tag-p">
                      <span>📅 Data do Evento:</span>
                      <span className="font-bold">
                        {new Date(item.event_date).toLocaleDateString('pt-BR', {
                          timeZone: 'UTC',
                          weekday: 'short',
                          day: '2-digit',
                          month: 'long',
                        })}
                      </span>
                    </div>
                  )}

                  {/* Imagem do Cartaz / Recado */}
                  {imageUrl && (
                    <div className="my-2.5 relative aspect-video w-full rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-black/40 shadow-sm">
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Conteúdo de Texto (se houver) */}
                  {text ? (
                    <p className="nkfs-p-m text-muted mt-2 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {text}
                    </p>
                  ) : imageUrl ? (
                    <p className="nkfs-p-m text-gold italic mt-1 font-medium">
                      Cartaz oficial divulgado em imagem.
                    </p>
                  ) : null}
                </div>

                {/* Barra de Ações */}
                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="nkfs-tag-p text-faint font-mono">
                    ID: {item.id.slice(0, 8)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="btn btn-outline btn-sm py-1 px-3 nkfs-tag-p text-muted hover:text-main"
                      title="Editar comunicado"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="btn btn-danger btn-sm py-1 px-3 nkfs-tag-p"
                      title="Excluir comunicado"
                    >
                      {deletingId === item.id ? (
                        <Spinner size="sm" />
                      ) : (
                        '🗑️ Excluir'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-8 text-center flex flex-col items-center">
          <span className="text-4xl mb-2">📭</span>
          <p className="nkfs-h-p font-bold text-main">
            Nenhum comunicado encontrado
          </p>
          <p className="nkfs-p-m text-muted mt-1 max-w-sm">
            {search || selectedCategory !== 'Todos'
              ? 'Tente ajustar os filtros ou o termo de busca.'
              : 'Clique em "+ Novo Aviso" para criar seu primeiro comunicado (texto ou imagem).'}
          </p>
        </div>
      )}

      {/* ── MODAL DE CRIAÇÃO / EDIÇÃO ──────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="card w-full max-w-lg p-6 shadow-2xl relative animate-slide-up flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h3 className="nkfs-h-p text-main font-bold">
                  {editingItem ? 'Editar Comunicado' : 'Novo Comunicado'}
                </h3>
                <p className="nkfs-tag-p text-muted mt-0.5">
                  Núcleo de Kung Fu Shaolin
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-muted hover:text-main"
              >
                ✕
              </button>
            </div>

            {/* Alerta de Erro */}
            {errorMessage && (
              <div className="alert alert-error">
                <span>⚠</span>
                <span className="nkfs-p-m">{errorMessage}</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Título */}
              <div className="field">
                <label className="label nkfs-tag-p text-muted" htmlFor="announcement-title">
                  Título do Aviso *
                </label>
                <input
                  id="announcement-title"
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ex: Exame de Faixas / Cartaz do Seminário"
                  required
                  className="input text-base"
                />
              </div>

              {/* Seletor de Modo: Texto vs Imagem/Cartaz vs Ambos */}
              <div className="field">
                <label className="label nkfs-tag-p text-muted">
                  Formato do Comunicado *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setContentMode('text')}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-center transition-all ${
                      contentMode === 'text'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-bold'
                        : 'border-[var(--color-border)] text-muted hover:text-main'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">📄</span>
                    <span className="nkfs-tag-p">Apenas Texto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContentMode('image')}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-center transition-all ${
                      contentMode === 'image'
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold-muted)] text-gold font-bold shadow-sm'
                        : 'border-[var(--color-border)] text-muted hover:text-main'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">🖼️</span>
                    <span className="nkfs-tag-p">Apenas Imagem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContentMode('both')}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-center transition-all ${
                      contentMode === 'both'
                        ? 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-success font-bold'
                        : 'border-[var(--color-border)] text-muted hover:text-main'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">📸</span>
                    <span className="nkfs-tag-p">Imagem + Texto</span>
                  </button>
                </div>
              </div>

              {/* Upload e Imagem (quando modo image ou both) */}
              {(contentMode === 'image' || contentMode === 'both') && (
                <div className="card-elevated p-4 flex flex-col gap-3 border border-[var(--color-border-gold)]">
                  <div className="flex items-center justify-between">
                    <span className="nkfs-tag-p text-gold uppercase font-bold tracking-wider">
                      Imagem / Cartaz do Recado
                    </span>
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="nkfs-tag-p text-error hover:underline"
                      >
                        Remover Imagem
                      </button>
                    )}
                  </div>

                  {/* Input de Arquivo (Upload Direto) */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-file-upload"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      {isUploading ? (
                        <>
                          <Spinner size="sm" />
                          <span>Enviando imagem...</span>
                        </>
                      ) : (
                        '📤 Escolher Arquivo de Imagem'
                      )}
                    </button>
                  </div>

                  {/* Ou Campo de Link / URL */}
                  <div className="field">
                    <label className="label nkfs-tag-p text-muted" htmlFor="image-url-input">
                      Ou insira o Link/URL da Imagem:
                    </label>
                    <input
                      id="image-url-input"
                      type="url"
                      value={formImageUrl}
                      onChange={e => setFormImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/cartaz.png"
                      className="input text-xs"
                    />
                  </div>

                  {/* Preview da Imagem Selecionada */}
                  {formImageUrl && (
                    <div className="relative aspect-video w-full rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-black/50">
                      <Image
                        src={formImageUrl}
                        alt="Preview do cartaz"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Destinatários do Comunicado */}
              <div className="field">
                <label className="label nkfs-tag-p text-muted">
                  Público-Alvo / Destinatários do Comunicado *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAudienceType('all')
                      setFormModalityId('')
                    }}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-center transition-all ${
                      audienceType === 'all'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-bold'
                        : 'border-[var(--color-border)] text-muted hover:text-main'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">🌐</span>
                    <span className="nkfs-tag-p">Todos os Alunos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAudienceType('modality')
                      if (!formModalityId && modalities.length > 0) {
                        setFormModalityId(modalities[0].id)
                      }
                    }}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-center transition-all ${
                      audienceType === 'modality'
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold-muted)] text-gold font-bold shadow-sm'
                        : 'border-[var(--color-border)] text-muted hover:text-main'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">🥋</span>
                    <span className="nkfs-tag-p">Por Modalidade</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAudienceType('group')
                      setFormModalityId('')
                    }}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-center transition-all ${
                      audienceType === 'group'
                        ? 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-success font-bold'
                        : 'border-[var(--color-border)] text-muted hover:text-main'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">👥</span>
                    <span className="nkfs-tag-p">Grupo de Alunos</span>
                  </button>
                </div>
              </div>

              {/* Seletor quando Por Modalidade */}
              {audienceType === 'modality' && (
                <div className="field animate-fade-in">
                  <label className="label nkfs-tag-p text-muted" htmlFor="announcement-modality">
                    Selecione a Modalidade Destino *
                  </label>
                  <select
                    id="announcement-modality"
                    value={formModalityId}
                    onChange={e => setFormModalityId(e.target.value)}
                    required
                    className="input text-sm"
                  >
                    <option value="">Escolha uma modalidade...</option>
                    {modalities.map(m => (
                      <option key={m.id} value={m.id}>
                        🥋 {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Seletor quando Grupo de Alunos com Search */}
              {audienceType === 'group' && (
                <div className="card-elevated p-4 flex flex-col gap-3 border border-[var(--color-border-gold)] animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👥</span>
                      <span className="nkfs-tag-p text-gold uppercase font-bold tracking-wider">
                        Alunos Destinatários ({selectedStudentIds.length})
                      </span>
                    </div>
                    {selectedStudentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSelectedStudents}
                        className="nkfs-tag-p text-error hover:underline cursor-pointer"
                      >
                        Limpar seleção
                      </button>
                    )}
                  </div>

                  {/* Chips dos alunos selecionados */}
                  {selectedStudentIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-[var(--color-bg)] rounded border border-[var(--color-border)]">
                      {selectedStudentIds.map(id => {
                        const student = (students || []).find(s => s.id === id)
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-gold-muted)] text-gold text-xs font-semibold border border-[var(--color-border-gold)]"
                          >
                            <span>{student?.full_name || id}</span>
                            <button
                              type="button"
                              onClick={() => toggleStudent(id)}
                              className="hover:text-error transition-colors ml-0.5"
                              title="Remover aluno"
                            >
                              ✕
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="nkfs-p-p text-muted italic">
                      Nenhum aluno selecionado. Busque e marque os alunos abaixo que devem receber este aviso.
                    </p>
                  )}

                  {/* Campo de Busca de Alunos */}
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        placeholder="Buscar aluno por nome, modalidade ou faixa..."
                        className="input text-xs py-2 px-3 w-full"
                      />
                      {studentSearch && (
                        <button
                          type="button"
                          onClick={() => setStudentSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {filteredStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={selectAllFilteredStudents}
                        className="btn btn-outline btn-sm text-xs py-1.5 px-3 shrink-0"
                      >
                        + Selecionar visíveis ({filteredStudents.length})
                      </button>
                    )}
                  </div>

                  {/* Lista de Alunos com Checkboxes */}
                  <div className="max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-[var(--radius-md)] divide-y divide-[var(--color-border)] bg-[var(--color-bg)]">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const isSelected = selectedStudentIds.includes(student.id)
                        return (
                          <label
                            key={student.id}
                            className={`flex items-center justify-between p-2.5 cursor-pointer text-xs transition-colors hover:bg-[var(--color-bg-elevated)] ${
                              isSelected ? 'bg-[var(--color-gold-muted)]/20 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleStudent(student.id)}
                                className="w-4 h-4 rounded text-gold accent-[var(--color-gold)] cursor-pointer"
                              />
                              <div>
                                <span className="text-main block font-medium">{student.full_name}</span>
                                {(student.modality_name || student.graduation_name) && (
                                  <span className="text-muted text-[10px]">
                                    {student.modality_name} {student.graduation_name ? `• ${student.graduation_name}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${isSelected ? 'text-gold font-bold' : 'text-muted'}`}>
                              {isSelected ? '✓ Selecionado' : '+ Adicionar'}
                            </span>
                          </label>
                        )
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-muted">
                        {studentSearch ? 'Nenhum aluno encontrado com este termo.' : 'Nenhum aluno cadastrado.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Categoria */}
              <div className="field">
                <label className="label nkfs-tag-p text-muted" htmlFor="announcement-category">
                  Categoria do Comunicado *
                </label>
                <select
                  id="announcement-category"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="input text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data do Evento */}
              <div className="field">
                <label className="label nkfs-tag-p text-muted" htmlFor="announcement-date">
                  Data do Evento (Opcional)
                </label>
                <input
                  id="announcement-date"
                  type="date"
                  value={formEventDate}
                  onChange={e => setFormEventDate(e.target.value)}
                  className="input text-sm"
                />
              </div>

              {/* Conteúdo / Descrição (obrigatório somente se NÃO for modo image-only) */}
              {contentMode !== 'image' && (
                <div className="field">
                  <label className="label nkfs-tag-p text-muted" htmlFor="announcement-content">
                    Descrição / Texto do Comunicado *
                  </label>
                  <textarea
                    id="announcement-content"
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    placeholder="Escreva as instruções e detalhes para os alunos..."
                    rows={4}
                    required={contentMode === 'text'}
                    className="input resize-y text-base"
                  />
                </div>
              )}

              {/* Botões do Modal */}
              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="btn btn-ghost btn-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-gold btn-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" />
                      <span>Salvando...</span>
                    </>
                  ) : editingItem ? (
                    'Salvar Alterações'
                  ) : (
                    'Publicar Aviso'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
