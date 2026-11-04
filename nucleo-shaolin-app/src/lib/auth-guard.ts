import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole, UserStatus } from '@/types/database'

export interface AuthenticatedContext {
  user: { id: string; email?: string }
  profile: {
    id: string
    full_name: string
    role: UserRole
    status: UserStatus
  }
  adminClient: ReturnType<typeof createAdminClient>
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Valida se uma string é um UUID válido (evita SQL/Path Injection em IDs).
 */
export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value.trim())
}

/**
 * Sanitiza texto removendo caracteres de controle/nulos e aplicando tamanho máximo.
 */
export function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength)
}

/**
 * Garante que uma URL seja estritamente HTTP/HTTPS (bloqueia javascript:, data:, vbscript:).
 */
export function isSafeHttpUrl(rawUrl: unknown): boolean {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return false
  try {
    const parsed = new URL(rawUrl.trim())
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Verifica a assinatura real (Magic Bytes) de um buffer de imagem
 * para impedir upload de scripts/HTML/SVG renomeados como .jpg/.png.
 */
export function isValidImageBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true
  }

  // GIF: "GIF87a" ou "GIF89a"
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return true
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true
  }

  return false
}

/**
 * Exige que o usuário esteja autenticado e com matrícula ativa.
 */
export async function requireActiveUser(): Promise<AuthenticatedContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Sessão expirada ou usuário não autenticado.')
  }

  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, full_name, role, status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Perfil de usuário não encontrado.')
  }

  if (profile.status !== 'active') {
    throw new Error('Sua conta não está ativa. Entre em contato com a administração da escola.')
  }

  return {
    user: { id: user.id, email: user.email },
    profile: profile as AuthenticatedContext['profile'],
    adminClient,
  }
}

/**
 * Exige que o usuário seja Instrutor, Admin ou Super Admin ativo.
 */
export async function requireStaffUser(): Promise<AuthenticatedContext> {
  const ctx = await requireActiveUser()

  if (!['instructor', 'admin', 'super_admin'].includes(ctx.profile.role)) {
    throw new Error('Acesso negado: permissão exclusiva para instrutores e administração.')
  }

  return ctx
}

/**
 * Exige que o usuário seja Super Admin ativo.
 */
export async function requireSuperAdmin(): Promise<AuthenticatedContext> {
  const ctx = await requireActiveUser()

  if (ctx.profile.role !== 'super_admin') {
    throw new Error('Acesso negado: permissão exclusiva da direção geral da escola.')
  }

  return ctx
}
