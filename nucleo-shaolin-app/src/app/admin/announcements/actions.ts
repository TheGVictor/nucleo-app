'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildAnnouncementContent } from '@/lib/announcements'
import type { Announcement } from '@/types/database'

export interface AnnouncementInput {
  title: string
  content?: string
  image_url?: string | null
  category: string
  event_date?: string | null
  modality_id?: string | null
  target_student_ids?: string[]
  target_student_names?: string[]
}

export interface AnnouncementWithModality extends Announcement {
  modality?: {
    id: string
    name: string
    slug: string
  } | null
}

async function verifyAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autenticado.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Acesso negado: permissão de instrutor ou Sifu necessária.')
  }

  return { user, profile }
}

export async function getAnnouncementsAction(): Promise<AnnouncementWithModality[]> {
  await verifyAdminAuth()
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('announcements')
    .select(`
      *,
      modality:modalities(id, name, slug)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
    throw new Error('Falha ao carregar avisos.')
  }

  return (data as AnnouncementWithModality[]) ?? []
}

export async function getModalitiesListAction() {
  await verifyAdminAuth()
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('modalities')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching modalities:', error)
    return []
  }

  return data ?? []
}

/**
 * Faz upload de imagem do aviso/cartaz para o bucket do Supabase Storage.
 */
export async function uploadAnnouncementImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await verifyAdminAuth()

    const file = formData.get('file') as File | null
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'Nenhum arquivo enviado.' }
    }

    // Validações básicas de formato e tamanho (máx 5MB)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Formato inválido. Use JPG, PNG, WEBP ou GIF.' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'A imagem deve ter no máximo 5MB.' }
    }

    const adminClient = createAdminClient()

    // Garante que o bucket 'announcements' exista
    try {
      await adminClient.storage.createBucket('announcements', { public: true })
    } catch {}

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `recado_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await adminClient.storage
      .from('announcements')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error in storage:', uploadError)
      return { success: false, error: 'Falha no upload da imagem: ' + uploadError.message }
    }

    const { data: publicUrlData } = adminClient.storage
      .from('announcements')
      .getPublicUrl(fileName)

    return { success: true, url: publicUrlData.publicUrl }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao processar imagem.' }
  }
}

export async function createAnnouncementAction(input: AnnouncementInput) {
  const { user } = await verifyAdminAuth()

  if (!input.title || input.title.trim().length < 3) {
    throw new Error('O título do aviso deve ter pelo menos 3 caracteres.')
  }

  const hasImage = Boolean(input.image_url && input.image_url.trim())
  const hasText = Boolean(input.content && input.content.trim().length >= 3)

  if (!hasImage && !hasText) {
    throw new Error('Adicione uma imagem (cartaz) ou uma descrição para o aviso.')
  }

  const adminClient = createAdminClient()

  // Constrói o conteúdo combinando a imagem (se houver), texto e destinatários específicos
  const unifiedContent = buildAnnouncementContent(
    input.content || '',
    input.image_url,
    input.target_student_ids,
    input.target_student_names
  )

  const payload = {
    title: input.title.trim(),
    content: unifiedContent,
    category: input.category || 'Aviso',
    event_date: input.event_date && input.event_date.trim() ? input.event_date.trim() : null,
    modality_id: input.modality_id && input.modality_id.trim() ? input.modality_id.trim() : null,
    author_id: user.id,
  }

  const { data, error } = await adminClient
    .from('announcements')
    .insert(payload)
    .select(`
      *,
      modality:modalities(id, name, slug)
    `)
    .single()

  if (error) {
    console.error('Error creating announcement:', error)
    throw new Error('Falha ao criar o aviso: ' + error.message)
  }

  revalidatePath('/admin')
  revalidatePath('/aluno')
  revalidatePath('/')

  return { success: true, announcement: data as AnnouncementWithModality }
}

export async function updateAnnouncementAction(id: string, input: AnnouncementInput) {
  await verifyAdminAuth()

  if (!id) throw new Error('ID do aviso é obrigatório.')

  if (!input.title || input.title.trim().length < 3) {
    throw new Error('O título do aviso deve ter pelo menos 3 caracteres.')
  }

  const hasImage = Boolean(input.image_url && input.image_url.trim())
  const hasText = Boolean(input.content && input.content.trim().length >= 3)

  if (!hasImage && !hasText) {
    throw new Error('Adicione uma imagem (cartaz) ou uma descrição para o aviso.')
  }

  const adminClient = createAdminClient()

  const unifiedContent = buildAnnouncementContent(
    input.content || '',
    input.image_url,
    input.target_student_ids,
    input.target_student_names
  )

  const payload = {
    title: input.title.trim(),
    content: unifiedContent,
    category: input.category || 'Aviso',
    event_date: input.event_date && input.event_date.trim() ? input.event_date.trim() : null,
    modality_id: input.modality_id && input.modality_id.trim() ? input.modality_id.trim() : null,
  }

  const { data, error } = await adminClient
    .from('announcements')
    .update(payload)
    .eq('id', id)
    .select(`
      *,
      modality:modalities(id, name, slug)
    `)
    .single()

  if (error) {
    console.error('Error updating announcement:', error)
    throw new Error('Falha ao atualizar o aviso: ' + error.message)
  }

  revalidatePath('/admin')
  revalidatePath('/aluno')
  revalidatePath('/')

  return { success: true, announcement: data as AnnouncementWithModality }
}

export async function deleteAnnouncementAction(id: string) {
  await verifyAdminAuth()

  if (!id) throw new Error('ID do aviso é obrigatório.')

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting announcement:', error)
    throw new Error('Falha ao excluir o aviso: ' + error.message)
  }

  revalidatePath('/admin')
  revalidatePath('/aluno')
  revalidatePath('/')

  return { success: true }
}
