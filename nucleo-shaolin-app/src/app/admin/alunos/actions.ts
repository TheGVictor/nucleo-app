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
