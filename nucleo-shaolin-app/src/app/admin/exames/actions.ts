'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyStaff() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Acesso negado: apenas instrutores ou o Sifu podem acessar.')
  }

  return { user, profile }
}

export interface CandidatePayload {
  studentId: string
  targetGraduationId?: string | null
  notes?: string | null
}

export interface CreateExamListPayload {
  title: string
  modalityId?: string | null
  notes?: string | null
  candidates: CandidatePayload[]
}

// ── CRIA LISTA DE EXAME E ENVIA AO SIFU ───────────────────────
export async function createExamListAction(
  payload: CreateExamListPayload
): Promise<{ success: boolean; error?: string; listId?: string }> {
  try {
    const { user } = await verifyStaff()
    const adminClient = createAdminClient()

    if (!payload.title.trim()) {
      return { success: false, error: 'O título da lista de exame é obrigatório.' }
    }

    if (!payload.candidates || payload.candidates.length === 0) {
      return { success: false, error: 'Selecione ao menos um aluno para a lista de exame.' }
    }

    // 1. Cria a lista de exame
    const { data: listData, error: listError } = await adminClient
      .from('exam_lists')
      .insert({
        title: payload.title.trim(),
        modality_id: payload.modalityId || null,
        instructor_id: user.id,
        notes: payload.notes ? payload.notes.trim() : null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (listError) {
      // Se a tabela não existir ainda no Supabase, retorna mensagem clara
      if (listError.message.includes('relation "public.exam_lists" does not exist')) {
        return {
          success: false,
          error:
            'A tabela "exam_lists" ainda não foi criada no Supabase. Execute a migration SQL no Supabase SQL Editor.',
        }
      }
      return { success: false, error: listError.message }
    }

    const examListId = listData.id

    // 2. Insere os candidatos
    const candidatesToInsert = payload.candidates.map((c) => ({
      exam_list_id: examListId,
      student_id: c.studentId,
      target_graduation_id: c.targetGraduationId || null,
      instructor_notes: c.notes ? c.notes.trim() : null,
    }))

    const { error: candError } = await adminClient
      .from('exam_list_candidates')
      .insert(candidatesToInsert)

    if (candError) {
      return { success: false, error: candError.message }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/exames')

    return { success: true, listId: examListId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar lista de exame'
    return { success: false, error: message }
  }
}

// ── SIFU APROVA OU MUDA STATUS DA LISTA DE EXAME ─────────────
export async function updateExamListStatusAction(
  examListId: string,
  newStatus: 'approved' | 'reviewed' | 'completed' | 'pending'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await verifyStaff()

    if (profile.role !== 'super_admin') {
      return { success: false, error: 'Apenas o Sifu (Super Admin) pode homologar listas de exame.' }
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('exam_lists')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', examListId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/exames')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar status do exame'
    return { success: false, error: message }
  }
}

// ── BUSCA LISTAS DE EXAME COM CANDIDATOS ──────────────────────
export interface DetailedExamList {
  id: string
  title: string
  modality_id: string | null
  instructor_id: string
  notes: string | null
  status: 'pending' | 'approved' | 'reviewed' | 'completed'
  created_at: string
  updated_at: string
  instructor?: { full_name: string; photo_url: string | null } | null
  modality?: { name: string; slug: string } | null
  candidatesCount: number
  candidates?: {
    id: string
    student_id: string
    target_graduation_id: string | null
    instructor_notes: string | null
    student?: { full_name: string; photo_url: string | null } | null
    target_graduation?: { level_name: string; color_hex: string | null } | null
  }[]
}

export async function getExamListsAction(): Promise<{
  success: boolean
  data: DetailedExamList[]
  error?: string
}> {
  try {
    await verifyStaff()
    const adminClient = createAdminClient()

    const { data: lists, error } = await adminClient
      .from('exam_lists')
      .select(`
        *,
        instructor:profiles!exam_lists_instructor_id_fkey(full_name, photo_url),
        modality:modalities(name, slug),
        candidates:exam_list_candidates(
          id,
          student_id,
          target_graduation_id,
          instructor_notes,
          student:profiles!exam_list_candidates_student_id_fkey(full_name, photo_url),
          target_graduation:graduations!exam_list_candidates_target_graduation_id_fkey(level_name, color_hex)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      // Se tabela ainda não existe, retorna vazio sem travar a aplicação
      if (error.message.includes('relation "public.exam_lists" does not exist')) {
        return { success: true, data: [] }
      }
      return { success: false, data: [], error: error.message }
    }

    const mapped: DetailedExamList[] = (lists ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      modality_id: l.modality_id,
      instructor_id: l.instructor_id,
      notes: l.notes,
      status: l.status,
      created_at: l.created_at,
      updated_at: l.updated_at,
      instructor: Array.isArray(l.instructor) ? l.instructor[0] : l.instructor,
      modality: Array.isArray(l.modality) ? l.modality[0] : l.modality,
      candidatesCount: l.candidates?.length ?? 0,
      candidates: l.candidates ?? [],
    }))

    return { success: true, data: mapped }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar listas de exame'
    return { success: false, data: [], error: message }
  }
}
