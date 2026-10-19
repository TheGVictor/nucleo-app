'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifySifu() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    throw new Error('Acesso negado: apenas o Sifu (Super Admin) pode gerenciar instrutores.')
  }

  return { user }
}

// ── SIFU PROMOVE ALUNO A INSTRUTOR OU RETORNA A ALUNO ─────────
export async function toggleInstructorRoleAction(
  studentId: string,
  newRole: 'instructor' | 'admin' | 'student'
): Promise<{ success: boolean; newRole?: 'instructor' | 'admin' | 'student'; error?: string }> {
  try {
    await verifySifu()
    const adminClient = createAdminClient()

    // Se o enum do postgres ainda só tiver 'admin', 'student', 'super_admin',
    // podemos usar 'admin' com fallback seguro caso 'instructor' lance erro de enum
    let roleToSave = newRole

    let { error } = await adminClient
      .from('profiles')
      .update({
        role: roleToSave,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)

    // Fallback: se o enum do postgres não tiver 'instructor' ainda, salva como 'admin'
    if (error && newRole === 'instructor' && error.message.includes('user_role')) {
      roleToSave = 'admin'
      const fallback = await adminClient
        .from('profiles')
        .update({
          role: roleToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
      error = fallback.error
    }

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/alunos')
    revalidatePath('/aluno/perfil')

    return { success: true, newRole: roleToSave }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao alterar papel do usuário'
    return { success: false, error: message }
  }
}
