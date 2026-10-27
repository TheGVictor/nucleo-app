'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatEmbedUrl } from '@/lib/video-utils'

export interface VideoFormData {
  title: string
  category: string
  description?: string
  videoUrl: string
  graduationId: string
  modalityId?: string
  durationMinutes?: number
}

// ── AUTENTICAÇÃO E PERMISSÃO ────────────────────────────────────
async function verifyInstructorOrAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Apenas instrutores e administradores podem gerenciar vídeos')
  }

  return { user, adminClient }
}

// ── CRIAR NOVO VÍDEO ────────────────────────────────────────────
export async function createVideoAction(formData: VideoFormData) {
  try {
    const { adminClient } = await verifyInstructorOrAdmin()

    if (!formData.title?.trim()) {
      return { success: false, error: 'O título do vídeo é obrigatório' }
    }
    if (!formData.videoUrl?.trim()) {
      return { success: false, error: 'A URL do vídeo é obrigatória' }
    }
    if (!formData.graduationId) {
      return { success: false, error: 'Selecione a faixa associada' }
    }
    if (!formData.category) {
      return { success: false, error: 'Selecione a categoria técnica' }
    }

    // Se modalityId não for fornecido, busca o da faixa (CLF)
    let modalityId = formData.modalityId
    if (!modalityId) {
      const { data: grad } = await adminClient
        .from('graduations')
        .select('modality_id')
        .eq('id', formData.graduationId)
        .single()
      modalityId = grad?.modality_id
    }

    const embedUrl = formatEmbedUrl(formData.videoUrl)
    const durationSeconds = formData.durationMinutes
      ? Math.round(Number(formData.durationMinutes) * 60)
      : null

    const { data, error } = await adminClient
      .from('videos')
      .insert({
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description?.trim() || null,
        video_url: embedUrl,
        duration_seconds: durationSeconds,
        modality_id: modalityId,
        min_graduation_id: formData.graduationId,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/videos')
    revalidatePath('/aluno/videos')

    return { success: true, videoId: data.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao cadastrar vídeo'
    return { success: false, error: message }
  }
}

// ── ATUALIZAR VÍDEO EXISTENTE ───────────────────────────────────
export async function updateVideoAction(videoId: string, formData: VideoFormData) {
  try {
    const { adminClient } = await verifyInstructorOrAdmin()

    if (!formData.title?.trim()) {
      return { success: false, error: 'O título do vídeo é obrigatório' }
    }
    if (!formData.videoUrl?.trim()) {
      return { success: false, error: 'A URL do vídeo é obrigatória' }
    }

    const embedUrl = formatEmbedUrl(formData.videoUrl)
    const durationSeconds = formData.durationMinutes
      ? Math.round(Number(formData.durationMinutes) * 60)
      : null

    const { error } = await adminClient
      .from('videos')
      .update({
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description?.trim() || null,
        video_url: embedUrl,
        duration_seconds: durationSeconds,
        min_graduation_id: formData.graduationId,
      })
      .eq('id', videoId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/videos')
    revalidatePath('/aluno/videos')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar vídeo'
    return { success: false, error: message }
  }
}

// ── EXCLUIR VÍDEO ───────────────────────────────────────────────
export async function deleteVideoAction(videoId: string) {
  try {
    const { adminClient } = await verifyInstructorOrAdmin()

    const { error } = await adminClient
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/videos')
    revalidatePath('/aluno/videos')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao remover vídeo'
    return { success: false, error: message }
  }
}

// ── OBTER URL ASSINADA PARA UPLOAD DIRETO NO SUPABASE STORAGE ───
export async function getSignedVideoUploadUrlAction(fileName: string, contentType?: string) {
  try {
    const { adminClient } = await verifyInstructorOrAdmin()

    if (!fileName) {
      return { success: false, error: 'Nome de arquivo inválido' }
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || 'mp4'
    const allowedExts = ['mp4', 'webm', 'mov', 'm4v']
    if (!allowedExts.includes(ext)) {
      return {
        success: false,
        error: 'Formato não suportado. Por favor, envie arquivos MP4, WebM ou MOV.',
      }
    }

    const safeFileName = `treino_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

    // Garante que o bucket 'videos' exista
    try {
      await adminClient.storage.createBucket('videos', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'],
      })
    } catch {}

    const { data, error } = await adminClient.storage
      .from('videos')
      .createSignedUploadUrl(safeFileName)

    if (error || !data) {
      return { success: false, error: error?.message || 'Falha ao gerar link de upload' }
    }

    const { data: pubData } = adminClient.storage
      .from('videos')
      .getPublicUrl(safeFileName)

    return {
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: pubData.publicUrl,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao preparar upload de vídeo'
    return { success: false, error: message }
  }
}

