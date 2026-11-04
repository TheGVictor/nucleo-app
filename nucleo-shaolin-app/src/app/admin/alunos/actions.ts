'use server'

import { revalidatePath } from 'next/cache'
import {
  requireStaffUser,
  isValidUuid,
  sanitizeText,
} from '@/lib/auth-guard'

// ── ENVIA RECADINHO / AVISO PERSONALIZADO PARA O ALUNO ────────
export async function sendPersonalNoticeAction(
  studentId: string,
  studentName: string,
  title: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUuid(studentId)) {
      return { success: false, error: 'ID do aluno inválido.' }
    }

    const { user, adminClient } = await requireStaffUser()

    const cleanName = sanitizeText(studentName, 120)
    const cleanTitle = sanitizeText(title, 150)
    const cleanContent = sanitizeText(content, 2000)

    if (!cleanTitle || !cleanContent) {
      return { success: false, error: 'Título e mensagem são obrigatórios.' }
    }

    // Busca modalidade ativa do aluno para vincular
    const { data: sm } = await adminClient
      .from('student_modalities')
      .select('modality_id')
      .eq('student_id', studentId)
      .limit(1)

    const modalityId = sm?.[0]?.modality_id || null

    const formattedTitle = `[Para ${cleanName}] ${cleanTitle}`
    const formattedContent = `${cleanContent}\n\n— Mensagem enviada pela Coordenação da Escola`

    const { error } = await adminClient.from('announcements').insert({
      title: formattedTitle,
      content: formattedContent,
      category: 'individual',
      modality_id: modalityId,
      author_id: user.id,
      event_date: null,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/aluno')
    revalidatePath('/aluno/ficha')
    revalidatePath('/admin/alunos')
    revalidatePath('/admin/avisos')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao enviar aviso'
    return { success: false, error: message }
  }
}

// ── ATUALIZA STATUS OU GRADUAÇÃO DO ALUNO ──────────────────────
export async function updateStudentModalityAction(
  studentId: string,
  modalityId: string,
  graduationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (
      !isValidUuid(studentId) ||
      !isValidUuid(modalityId) ||
      !isValidUuid(graduationId)
    ) {
      return { success: false, error: 'Identificadores inválidos.' }
    }

    const { adminClient } = await requireStaffUser()

    const { error } = await adminClient
      .from('student_modalities')
      .update({
        approved_graduation_id: graduationId,
      })
      .eq('student_id', studentId)
      .eq('modality_id', modalityId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/aluno')
    revalidatePath('/aluno/ficha')
    revalidatePath('/aluno/perfil')
    revalidatePath('/admin/alunos')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar dados'
    return { success: false, error: message }
  }
}

// ── HOMOLOGAÇÃO & APROVAÇÃO COM CORREÇÃO DE DADOS ──────────────
export interface StudentModalityApprovalItem {
  id: string // student_modalities.id
  modalityId: string
  graduationId: string
  levelName?: string
}

export interface StudentApprovalData {
  studentId: string
  fullName: string
  birthDate: string
  phone?: string | null
  modalities: StudentModalityApprovalItem[]
}

export async function approveStudentWithEditsAction(
  data: StudentApprovalData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUuid(data.studentId)) {
      return { success: false, error: 'ID do aluno inválido.' }
    }

    const { adminClient } = await requireStaffUser()

    const cleanFullName = sanitizeText(data.fullName, 120)
    if (!cleanFullName || cleanFullName.length < 2) {
      return { success: false, error: 'Nome do aluno inválido.' }
    }

    const cleanPhone = data.phone ? sanitizeText(data.phone, 30) : null
    const cleanBirthDate = /^\d{4}-\d{2}-\d{2}$/.test(data.birthDate?.trim() || '')
      ? data.birthDate.trim()
      : undefined

    // 1. Atualiza dados cadastrais e ativa o perfil
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: cleanFullName,
        ...(cleanBirthDate ? { birth_date: cleanBirthDate } : {}),
        phone: cleanPhone,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.studentId)

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // 2. Para cada modalidade, ativa e define a graduação homologada
    for (const sm of data.modalities) {
      if (!isValidUuid(sm.id)) continue

      const { error: smError } = await adminClient
        .from('student_modalities')
        .update({
          status: 'active',
          approved_graduation_id: isValidUuid(sm.graduationId) ? sm.graduationId : null,
          self_reported_level: sm.levelName ? sanitizeText(sm.levelName, 80) : null,
        })
        .eq('id', sm.id)
        .eq('student_id', data.studentId)

      if (smError) {
        console.error('Error updating student modality:', smError)
      }

      // 3. Registra no histórico de graduações
      if (isValidUuid(sm.graduationId) && isValidUuid(sm.modalityId)) {
        await adminClient.from('graduation_history').insert({
          student_id: data.studentId,
          modality_id: sm.modalityId,
          graduation_id: sm.graduationId,
          promoted_at: new Date().toISOString(),
          notes: 'Graduação inicial homologada na aprovação de cadastro',
        })
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/alunos')
    revalidatePath('/aluno')
    revalidatePath('/aluno/ficha')
    revalidatePath('/aluno/perfil')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao aprovar cadastro'
    return { success: false, error: message }
  }
}

// ── RECUSA DE CADASTRO ────────────────────────────────────────
export async function rejectStudentRegistrationAction(
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUuid(studentId)) {
      return { success: false, error: 'ID do aluno inválido.' }
    }

    const { adminClient } = await requireStaffUser()

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Marca também as modalidades do aluno como recusadas
    await adminClient
      .from('student_modalities')
      .update({
        status: 'rejected',
      })
      .eq('student_id', studentId)

    revalidatePath('/admin')
    revalidatePath('/admin/alunos')
    revalidatePath('/aguardando')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao recusar cadastro'
    return { success: false, error: message }
  }
}
