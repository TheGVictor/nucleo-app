'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  type TechnicalCardState,
  getTechnicalSheetSchema,
} from '@/lib/technicalSheetData'
import { modalityHasFicha } from '@/lib/modality-utils'

export interface StudentTechnicalSheetResponse {
  success: boolean
  data?: {
    student: {
      id: string
      full_name: string
      birth_date?: string
      created_at: string
      photo_url?: string | null
    }
    modalityName: string
    modalityId: string
    graduationName: string
    graduationColor: string
    beltSlug: string
    sheetState: TechnicalCardState
    isInstructor: boolean
  }
  error?: string
}

// ── CARREGA DADOS DA FICHA TÉCNICA DO ALUNO ───────────────────
export async function getStudentTechnicalSheetAction(
  studentId: string,
  targetModalityId?: string
): Promise<StudentTechnicalSheetResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const adminClient = createAdminClient()

    let isInstructor = false

    // 1. Validação de permissão: se for outro usuário, precisa ser instrutor ou admin
    if (user.id !== studentId) {
      const { data: requesterProfile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      isInstructor = ['instructor', 'admin', 'super_admin'].includes(
        requesterProfile?.role || ''
      )

      if (!isInstructor) {
        return { success: false, error: 'Acesso não autorizado à ficha' }
      }
    }

    // 2. Busca Perfil, Modalidade/Graduação e Progresso Técnico em paralelo
    let modQuery = adminClient
      .from('student_modalities')
      .select(`
        *,
        modality:modalities(id, name, slug),
        approved_graduation:graduations(id, level_name, level_order, color_hex)
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')

    if (targetModalityId) {
      modQuery = modQuery.eq('modality_id', targetModalityId)
    }

    const [
      { data: student, error: studentError },
      { data: studentModalities },
      { data: progressRecords },
    ] = await Promise.all([
      adminClient
        .from('profiles')
        .select('id, full_name, birth_date, created_at, photo_url')
        .eq('id', studentId)
        .single(),
      modQuery,
      adminClient
        .from('technical_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('evaluation_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1),
    ])

    if (studentError || !student) {
      return { success: false, error: 'Aluno não encontrado' }
    }

    const activeMod =
      studentModalities?.find((sm) => modalityHasFicha(sm.modality)) ??
      studentModalities?.[0]
    const modalityName = activeMod?.modality?.name ?? 'Kung Fu Shaolin'
    const modalityId = activeMod?.modality?.id ?? ''
    const graduationName =
      activeMod?.approved_graduation?.level_name ??
      activeMod?.self_reported_level ??
      'Faixa Laranja'
    const graduationColor =
      activeMod?.approved_graduation?.color_hex ?? '#FF8C00'

    // Normaliza slug da faixa para carregar o schema correto
    const beltSlug = graduationName.toLowerCase().trim().replace(/\s+/g, '-')
    const schema = getTechnicalSheetSchema(beltSlug)

    const latestRecord = progressRecords?.[0]

    let sheetState: TechnicalCardState = {
      version: 1,
      beltSlug: schema.beltSlug,
      cardNumber: `Nº ${studentId.slice(0, 4).toUpperCase()}`,
      startDate: student.created_at ? student.created_at.split('T')[0] : '',
      vistoDate: new Date().toISOString().split('T')[0],
      program: modalityName,
      repetitions: {},
      examEvaluations: {
        avaliacaoExame: false,
        liberacaoExame: false,
      },
      notes: '',
    }

    if (latestRecord && latestRecord.notes) {
      try {
        const parsed = JSON.parse(latestRecord.notes)
        if (parsed && typeof parsed === 'object') {
          sheetState = {
            ...sheetState,
            ...parsed,
            // Garante que o nome do programa e dados essenciais permaneçam atualizados
            cardNumber: parsed.cardNumber || sheetState.cardNumber,
            startDate: parsed.startDate || sheetState.startDate,
            vistoDate: parsed.vistoDate || sheetState.vistoDate,
            repetitions: parsed.repetitions || {},
            examEvaluations: parsed.examEvaluations || {
              avaliacaoExame: false,
              liberacaoExame: false,
            },
            notes: parsed.notes || '',
            updatedAt: latestRecord.created_at,
          }
        }
      } catch {
        // Se notes não for JSON puro, usa como anotação textual
        sheetState.notes = latestRecord.notes
      }
    }

    return {
      success: true,
      data: {
        student,
        modalityName,
        modalityId,
        graduationName,
        graduationColor,
        beltSlug: schema.beltSlug,
        sheetState,
        isInstructor,
      },
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao buscar ficha técnica'
    return { success: false, error: message }
  }
}

// ── SALVA A FICHA TÉCNICA EDITADA PELO INSTRUTOR ──────────────
export async function saveStudentTechnicalSheetAction(
  studentId: string,
  sheetData: TechnicalCardState
): Promise<{ success: boolean; updatedAt?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const adminClient = createAdminClient()

    // 1. Valida permissão de instrutor
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
      return {
        success: false,
        error: 'Apenas instrutores e administradores podem salvar a ficha técnica',
      }
    }

    // 2. Busca modalidade ativa do aluno
    const { data: studentModalities } = await adminClient
      .from('student_modalities')
      .select('modality_id')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .limit(1)

    const modalityId = studentModalities?.[0]?.modality_id

    const nowIso = new Date().toISOString()
    const todayDate = nowIso.split('T')[0]

    const fullPayload: TechnicalCardState = {
      ...sheetData,
      vistoDate: todayDate,
      updatedAt: nowIso,
      updatedByName: profile.full_name,
    }

    const notesJson = JSON.stringify(fullPayload)

    // 3. Verifica se já existe um registro para atualizar ou insere um novo
    const { data: existing } = await adminClient
      .from('technical_progress')
      .select('id')
      .eq('student_id', studentId)
      .limit(1)

    if (existing && existing.length > 0) {
      const recordId = existing[0].id
      const { error: updateError } = await adminClient
        .from('technical_progress')
        .update({
          notes: notesJson,
          evaluation_date: todayDate,
          instructor_id: user.id,
        })
        .eq('id', recordId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    } else {
      const { error: insertError } = await adminClient
        .from('technical_progress')
        .insert({
          student_id: studentId,
          modality_id: modalityId || null,
          evaluation_date: todayDate,
          notes: notesJson,
          instructor_id: user.id,
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    revalidatePath('/aluno/ficha')
    revalidatePath('/aluno')
    revalidatePath('/admin')

    return { success: true, updatedAt: nowIso }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao salvar ficha técnica'
    return { success: false, error: message }
  }
}
