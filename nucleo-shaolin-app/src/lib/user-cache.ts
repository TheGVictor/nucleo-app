import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DEDUPLICAÇÃO DE REQUISIÇÕES POR REQUEST (React Request Cache)
 * ═══════════════════════════════════════════════════════════════════════════
 * Se o Layout e a Página solicitarem o perfil do aluno na mesma renderização,
 * o React executa a busca no Supabase APENAS 1 VEZ e compartilha o resultado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const getRequestUserProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return profile
})

export const getRequestStudentModalities = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: modalities } = await supabase
    .from('student_modalities')
    .select(`
      *,
      modality:modalities(id, name, slug),
      approved_graduation:graduations(id, level_name, level_order, color_hex)
    `)
    .eq('student_id', userId)

  return modalities ?? []
})
