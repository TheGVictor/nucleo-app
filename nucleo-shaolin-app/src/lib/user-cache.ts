import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeTonLong } from '@/lib/modality-utils'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DEDUPLICAÇÃO DE AUTENTICAÇÃO E PERFIL POR REQUEST (React Request Cache)
 * ═══════════════════════════════════════════════════════════════════════════
 * Evita múltiplos round-trips de rede ao Supabase Auth (getUser) no mesmo
 * ciclo de renderização (Layout + Page + Server Actions).
 * Usa getSession() para decodificação instantânea do cookie JWT (~0ms).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const getRequestAuthUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    return session.user
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
})

export const getRequestUserProfile = cache(async (userId: string) => {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return profile
})

export const getRequestStudentModalities = cache(async (userId: string) => {
  const admin = createAdminClient()
  const { data: modalities } = await admin
    .from('student_modalities')
    .select(`
      *,
      modality:modalities(id, name, slug),
      approved_graduation:graduations(id, level_name, level_order, color_hex)
    `)
    .eq('student_id', userId)

  return (modalities ?? []).map((sm) => ({
    ...sm,
    modality: sm.modality
      ? {
          ...sm.modality,
          name: normalizeTonLong(sm.modality.name),
        }
      : null,
  }))
})
