'use server'

import { revalidatePath } from 'next/cache'
import {
  requireActiveUser,
  requireStaffUser,
  isValidUuid,
  isValidImageBuffer,
} from '@/lib/auth-guard'
import type { Attendance } from '@/types/database'

export interface StudentAttendanceCardData {
  student: {
    id: string
    full_name: string
    role: string
    status: string
    photo_url: string | null
    created_at: string
  }
  modalityName: string
  graduationName: string
  graduationColor: string
  attendances: Attendance[]
  cardPhotoUrl: string | null
  totalClassesTarget: number
}

// ── OBTÉM DADOS DO CARTÃO DE PRESENÇA DE UM ALUNO ─────────────
export async function getStudentAttendanceCardDataAction(studentId: string): Promise<{
  success: boolean
  data?: StudentAttendanceCardData
  error?: string
}> {
  try {
    if (!isValidUuid(studentId)) {
      return { success: false, error: 'Identificador de aluno inválido.' }
    }

    const { user, profile, adminClient } = await requireActiveUser()

    // Anti-IDOR: aluno só pode consultar o próprio cartão; terceiros exigem permissão de instrutor/admin
    const isStaff = ['instructor', 'admin', 'super_admin'].includes(profile.role)
    if (user.id !== studentId && !isStaff) {
      return { success: false, error: 'Acesso não autorizado ao cartão de presença.' }
    }

    // 1. Perfil do aluno
    const { data: student, error: studentError } = await adminClient
      .from('profiles')
      .select('id, full_name, role, status, photo_url, created_at')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Aluno não encontrado' }
    }

    // 2. Modalidade e graduação ativa
    const { data: studentModalities } = await adminClient
      .from('student_modalities')
      .select(`
        *,
        modality:modalities(id, name, slug),
        approved_graduation:graduations(id, level_name, level_order, color_hex)
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .limit(1)

    const activeMod = studentModalities?.[0]
    const modalityName = activeMod?.modality?.name ?? 'Kung Fu Shaolin'
    const graduationName = activeMod?.approved_graduation?.level_name ?? 'Faixa Branca'
    const graduationColor = activeMod?.approved_graduation?.color_hex ?? '#E2E8F0'

    // 3. Registros de presença ordenados por data
    const { data: attendances, error: attError } = await adminClient
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('present', true)
      .order('class_date', { ascending: true })

    if (attError) {
      return { success: false, error: attError.message }
    }

    // 4. Verifica se existe foto da ficha física no storage
    const { data: files } = await adminClient.storage
      .from('attendance_cards')
      .list('', { search: studentId })

    let cardPhotoUrl: string | null = null
    const matchingFile = files?.find((f) => f.name.startsWith(studentId))

    if (matchingFile) {
      const { data: urlData } = adminClient.storage
        .from('attendance_cards')
        .getPublicUrl(matchingFile.name)
      const rawDate = matchingFile.updated_at || matchingFile.created_at
      const timeVal = rawDate ? new Date(rawDate).getTime() : Date.now()
      cardPhotoUrl = `${urlData.publicUrl}?t=${timeVal}`
    }

    return {
      success: true,
      data: {
        student,
        modalityName,
        graduationName,
        graduationColor,
        attendances: attendances ?? [],
        cardPhotoUrl,
        totalClassesTarget: 30,
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar cartão de presença'
    return { success: false, error: message }
  }
}

// ── MARCAR CHECKBOX DE PRESENÇA (ADICIONAR PRESENÇA) ─────────
export async function checkAttendanceBoxAction(
  studentId: string,
  classDate?: string
): Promise<{ success: boolean; attendance?: Attendance; error?: string }> {
  try {
    if (!isValidUuid(studentId)) {
      return { success: false, error: 'Identificador de aluno inválido.' }
    }

    const { user, adminClient } = await requireStaffUser()
    const rawDate = classDate?.trim() || new Date().toISOString().split('T')[0]
    const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : new Date().toISOString().split('T')[0]

    const { data, error } = await adminClient
      .from('attendance')
      .insert({
        student_id: studentId,
        class_date: targetDate,
        present: true,
        recorded_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/aluno')
    revalidatePath('/aluno/ficha')
    revalidatePath('/admin')

    return { success: true, attendance: data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao marcar presença'
    return { success: false, error: message }
  }
}

// ── DESMARCAR CHECKBOX DE PRESENÇA (REMOVER PRESENÇA) ────────
export async function uncheckAttendanceBoxAction(
  attendanceId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUuid(attendanceId) || !isValidUuid(studentId)) {
      return { success: false, error: 'Identificador inválido.' }
    }

    const { adminClient } = await requireStaffUser()

    const { error } = await adminClient
      .from('attendance')
      .delete()
      .eq('id', attendanceId)
      .eq('student_id', studentId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/aluno')
    revalidatePath('/aluno/ficha')
    revalidatePath('/admin')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao desmarcar presença'
    return { success: false, error: message }
  }
}

// ── UPLOAD DA FOTO DA FICHA FÍSICA DO ALUNO ───────────────────
export async function uploadAttendanceCardPhotoAction(formData: FormData): Promise<{
  success: boolean
  photoUrl?: string
  error?: string
}> {
  try {
    const { adminClient } = await requireStaffUser()

    const file = formData.get('file') as File | null
    const studentId = formData.get('studentId') as string | null

    if (!file || !(file instanceof File) || !studentId || !isValidUuid(studentId)) {
      return { success: false, error: 'Arquivo e identificador válido do aluno são obrigatórios' }
    }

    // Valida tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'A foto deve ter no máximo 10MB' }
    }

    // Valida tipo MIME
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return { success: false, error: 'Formato inválido. Use JPG, PNG ou WEBP' }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Valida Magic Bytes reais da imagem
    if (!isValidImageBuffer(buffer)) {
      return { success: false, error: 'O conteúdo do arquivo não é uma imagem válida.' }
    }

    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg'
    const fileName = `${studentId}.${safeExt}`

    const { error: uploadError } = await adminClient.storage
      .from('attendance_cards')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: urlData } = adminClient.storage
      .from('attendance_cards')
      .getPublicUrl(fileName)

    const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`

    revalidatePath('/aluno/ficha')
    revalidatePath('/admin')

    return { success: true, photoUrl }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao fazer upload da foto da ficha'
    return { success: false, error: message }
  }
}
