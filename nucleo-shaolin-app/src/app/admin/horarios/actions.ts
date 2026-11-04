'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidUuid, sanitizeText } from '@/lib/auth-guard'
import type { ClassSchedule } from '@/types/database'
import { normalizeTonLong } from '@/lib/modality-utils'

export interface ClassScheduleWithModality extends ClassSchedule {
  modality?: {
    id: string
    name: string
    slug: string
  } | null
}

async function verifyAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Acesso negado: permissão de instrutor necessária.')
  }

  return { user, profile }
}

export async function getClassSchedulesAction(): Promise<ClassScheduleWithModality[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('class_schedules')
    .select(`
      *,
      modality:modalities(id, name, slug)
    `)
    .order('day_of_week')
    .order('start_time')

  if (error) {
    console.error('Error fetching class schedules:', error)
    return []
  }

  const list = (data as unknown as ClassScheduleWithModality[]) ?? []
  return list.map((s) => ({
    ...s,
    title: normalizeTonLong(s.title),
    modality: s.modality
      ? { ...s.modality, name: normalizeTonLong(s.modality.name) }
      : null,
  }))
}

export async function createClassScheduleAction(input: {
  modality_id: string
  title: string
  day_of_week: number
  start_time: string
  end_time: string
}): Promise<{ success: boolean; data?: ClassScheduleWithModality; error?: string }> {
  try {
    await verifyAdminAuth()
    if (!isValidUuid(input.modality_id)) {
      return { success: false, error: 'Modalidade inválida.' }
    }
    const cleanTitle = sanitizeText(input.title, 120)
    if (!cleanTitle) {
      return { success: false, error: 'Título da aula é obrigatório.' }
    }
    const dayOfWeek = Math.max(0, Math.min(6, Math.floor(Number(input.day_of_week) || 0)))
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('class_schedules')
      .insert({
        modality_id: input.modality_id,
        title: cleanTitle,
        day_of_week: dayOfWeek,
        start_time: input.start_time,
        end_time: input.end_time,
        active: true,
      })
      .select(`
        *,
        modality:modalities(id, name, slug)
      `)
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/horarios')
    revalidatePath('/aluno')
    revalidatePath('/admin')

    return { success: true, data: data as unknown as ClassScheduleWithModality }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar horário'
    return { success: false, error: message }
  }
}

export async function updateClassScheduleAction(
  id: string,
  input: {
    modality_id: string
    title: string
    day_of_week: number
    start_time: string
    end_time: string
    active?: boolean
  }
): Promise<{ success: boolean; data?: ClassScheduleWithModality; error?: string }> {
  try {
    await verifyAdminAuth()
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('class_schedules')
      .update({
        modality_id: input.modality_id,
        title: input.title.trim(),
        day_of_week: input.day_of_week,
        start_time: input.start_time,
        end_time: input.end_time,
        ...(input.active !== undefined ? { active: input.active } : {}),
      })
      .eq('id', id)
      .select(`
        *,
        modality:modalities(id, name, slug)
      `)
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/horarios')
    revalidatePath('/aluno')
    revalidatePath('/admin')

    return { success: true, data: data as unknown as ClassScheduleWithModality }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar horário'
    return { success: false, error: message }
  }
}

export async function deleteClassScheduleAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdminAuth()
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('class_schedules')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/horarios')
    revalidatePath('/aluno')
    revalidatePath('/admin')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao remover horário'
    return { success: false, error: message }
  }
}
