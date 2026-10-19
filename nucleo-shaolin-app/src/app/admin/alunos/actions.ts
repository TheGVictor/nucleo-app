'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyInstructor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Acesso negado: apenas instrutores autorizados.')
  }

  return { user, profile }
}

// ── ENVIA RECADINHO / AVISO PERSONALIZADO PARA O ALUNO ────────
export async function sendPersonalNoticeAction(
  studentId: string,
  studentName: string,
  title: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await verifyInstructor()
    const adminClient = createAdminClient()

    // Busca modalidade ativa do aluno para vincular
    const { data: sm } = await adminClient
      .from('student_modalities')
      .select('modality_id')
      .eq('student_id', studentId)
      .limit(1)

    const modalityId = sm?.[0]?.modality_id || null

    const formattedTitle = `[Para ${studentName}] ${title.trim()}`
    const formattedContent = `${content.trim()}\n\n— Mensagem enviada pelo Sifu ${profile.full_name}`

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
    await verifyInstructor()
    const adminClient = createAdminClient()

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
    await verifyInstructor()
    const adminClient = createAdminClient()

    // 1. Atualiza dados cadastrais e ativa o perfil
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: data.fullName.trim(),
        birth_date: data.birthDate,
        phone: data.phone ? data.phone.trim() : null,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.studentId)

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // 2. Para cada modalidade, ativa e define a graduação homologada
    for (const sm of data.modalities) {
      const { error: smError } = await adminClient
        .from('student_modalities')
        .update({
          status: 'active',
          approved_graduation_id: sm.graduationId,
          self_reported_level: sm.levelName || null,
        })
        .eq('id', sm.id)

      if (smError) {
        console.error('Error updating student modality:', smError)
      }

      // 3. Registra no histórico de graduações
      if (sm.graduationId) {
        await adminClient.from('graduation_history').insert({
          student_id: data.studentId,
          modality_id: sm.modalityId,
          graduation_id: sm.graduationId,
          promoted_at: new Date().toISOString(),
          notes: 'Graduação inicial homologada pelo Sifu na aprovação de cadastro',
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
    await verifyInstructor()
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('profiles')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/alunos')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao recusar cadastro'
    return { success: false, error: message }
  }
}
