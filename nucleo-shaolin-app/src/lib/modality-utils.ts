/**
 * Normaliza qualquer variação incorreta de "TanLang", "Tan Lang", "Tang Lang" ou "TangLang"
 * para a grafia correta adotada pela escola: "Ton Long".
 */
export function normalizeTonLong(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/\btan\s*g?\s*lang\b/gi, 'Ton Long')
}

export interface ModalityLike {
  slug?: string | null
  name?: string | null
}

export interface StudentModalityLike {
  status?: string | null
  modality?: ModalityLike | null
}

/**
 * Verifica se uma modalidade corresponde a Sanda (Boxe Chinês).
 */
export function isSandaModality(modality?: ModalityLike | null): boolean {
  if (!modality) return false
  const slug = modality.slug?.toLowerCase().trim() || ''
  const name = modality.name?.toLowerCase().trim() || ''
  return (
    slug === 'sanda' ||
    name.includes('sanda') ||
    name.includes('boxe chinês') ||
    name.includes('boxe chines')
  )
}

/**
 * Verifica se uma modalidade corresponde a Tai Chi Chuan.
 */
export function isTaiChiModality(modality?: ModalityLike | null): boolean {
  if (!modality) return false
  const slug = modality.slug?.toLowerCase().trim() || ''
  const name = modality.name?.toLowerCase().trim() || ''
  return (
    slug === 'taichi' ||
    slug === 'tai-chi' ||
    name.includes('tai chi') ||
    name.includes('taichi')
  )
}

/**
 * Verifica se uma modalidade possui Ficha Técnica.
 * - Kung Fu Choy Lay Fut / Ton Long: possui Ficha Técnica
 * - Tai Chi Chuan: NÃO possui Ficha Técnica
 * - Sanda: NÃO possui Ficha Técnica
 */
export function modalityHasFicha(modality?: ModalityLike | null): boolean {
  if (!modality) return false
  return !isSandaModality(modality) && !isTaiChiModality(modality)
}

/**
 * Verifica se uma modalidade possui biblioteca de Vídeos.
 * - Kung Fu Choy Lay Fut / Ton Long: possui Vídeos
 * - Tai Chi Chuan: possui Vídeos
 * - Sanda: NÃO possui Vídeos
 */
export function modalityHasVideos(modality?: ModalityLike | null): boolean {
  if (!modality) return false
  return !isSandaModality(modality)
}

function getRelevantModalities(
  studentModalities?: StudentModalityLike[] | null
): StudentModalityLike[] {
  if (!studentModalities || studentModalities.length === 0) return []
  const activeList = studentModalities.filter((sm) => sm.status === 'active')
  return activeList.length > 0 ? activeList : studentModalities
}

/**
 * Retorna true se o aluno possui pelo menos uma modalidade com Ficha Técnica
 * (ex: Choy Lay Fut / Ton Long). Alunos de somente Sanda ou somente Tai Chi (ou Sanda + Tai Chi)
 * retornam false.
 */
export function studentHasFicha(
  studentModalities?: StudentModalityLike[] | null
): boolean {
  const relevant = getRelevantModalities(studentModalities)
  if (relevant.length === 0) return true
  return relevant.some((sm) => modalityHasFicha(sm.modality))
}

/**
 * Retorna true se o aluno possui pelo menos uma modalidade com Vídeos
 * (ex: Choy Lay Fut, Ton Long ou Tai Chi Chuan). Alunos de somente Sanda retornam false.
 */
export function studentHasVideos(
  studentModalities?: StudentModalityLike[] | null
): boolean {
  const relevant = getRelevantModalities(studentModalities)
  if (relevant.length === 0) return true
  return relevant.some((sm) => modalityHasVideos(sm.modality))
}

/**
 * Retorna true quando o aluno está matriculado EXCLUSIVAMENTE em Sanda.
 */
export function isOnlySandaStudent(
  studentModalities?: StudentModalityLike[] | null
): boolean {
  const relevant = getRelevantModalities(studentModalities)
  return relevant.length > 0 && relevant.every((sm) => isSandaModality(sm.modality))
}
