'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidUuid, sanitizeText } from '@/lib/auth-guard'

const ALLOWED_MODALITY_SLUGS = ['clf', 'taichi', 'tanglang', 'sanda']

export interface FinalizeRegistrationInput {
  userId: string
  fullName: string
  birthDate: string
  selectedModalities: string[]
  selfReported: Record<string, string>
  termsAccepted: boolean
  imageRightsAccepted: boolean
  healthAccepted: boolean
}

export async function finalizeStudentRegistrationAction(
  input: FinalizeRegistrationInput
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUuid(input.userId)) {
      return { success: false, error: 'Identificador de usuário inválido.' }
    }

    if (!input.termsAccepted || !input.imageRightsAccepted || !input.healthAccepted) {
      return { success: false, error: 'Aceite todos os termos obrigatórios para prosseguir.' }
    }

    const cleanName = sanitizeText(input.fullName, 120)
    if (!cleanName || cleanName.length < 3) {
      return { success: false, error: 'Informe seu nome completo.' }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate || '')) {
      return { success: false, error: 'Data de nascimento inválida.' }
    }

    const validSlugs = (input.selectedModalities || []).filter((slug) =>
      ALLOWED_MODALITY_SLUGS.includes(slug)
    )
    if (validSlugs.length === 0) {
      return { success: false, error: 'Selecione ao menos uma modalidade válida.' }
    }

    // Confere se há sessão ativa e que pertence ao mesmo usuário
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && user.id !== input.userId) {
      return { success: false, error: 'Conflito de sessão. Recarregue a página.' }
    }

    const adminClient = createAdminClient()

    // Verifica se o perfil existe e não foi recusado anteriormente
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, status, role')
      .eq('id', input.userId)
      .maybeSingle()

    if (existingProfile?.status === 'rejected') {
      return {
        success: false,
        error:
          'Este cadastro foi recusado pela administração. Novos envios estão desativados para esta conta.',
      }
    }

    if (existingProfile?.status === 'active') {
      return {
        success: false,
        error: 'Esta conta já está ativa.',
      }
    }

    // Atualiza apenas os termos e garante que role='student' e status='pending_approval'
    const { error: updateErr } = await adminClient
      .from('profiles')
      .update({
        full_name: cleanName,
        birth_date: input.birthDate,
        terms_accepted: true,
        image_rights_accepted: true,
        health_declaration_accepted: true,
        role: 'student',
        status: 'pending_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.userId)

    if (updateErr) {
      return { success: false, error: 'Erro ao registrar dados do perfil.' }
    }

    // Busca IDs das modalidades permitidas
    const { data: modalitiesData } = await adminClient
      .from('modalities')
      .select('id, slug')
      .in('slug', validSlugs)

    if (modalitiesData && modalitiesData.length > 0) {
      // Remove eventuais duplicatas pendentes antes de inserir
      await adminClient
        .from('student_modalities')
        .delete()
        .eq('student_id', input.userId)
        .eq('status', 'pending_approval')

      const inserts = (modalitiesData as { id: string; slug: string }[]).map((m) => ({
        student_id: input.userId,
        modality_id: m.id,
        self_reported_level: input.selfReported?.[m.slug]
          ? sanitizeText(input.selfReported[m.slug], 60)
          : 'Faixa Branca',
        approved_graduation_id: null,
        status: 'pending_approval' as const,
      }))

      await adminClient.from('student_modalities').insert(inserts)
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao finalizar solicitação de matrícula.' }
  }
}
