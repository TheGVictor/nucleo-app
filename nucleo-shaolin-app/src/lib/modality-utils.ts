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
 * Retorna true quando o aluno está matriculado EXCLUSIVAMENTE em Sanda
 * (sem Choy Lay Fut, Ton Long ou Tai Chi Chuan).
 * Alunos de somente Sanda não possuem Ficha Técnica nem Vídeos no menu.
 */
export function isOnlySandaStudent(
  studentModalities?: StudentModalityLike[] | null
): boolean {
  if (!studentModalities || studentModalities.length === 0) return false

  const activeList = studentModalities.filter((sm) => sm.status === 'active')
  const relevant = activeList.length > 0 ? activeList : studentModalities

  return relevant.length > 0 && relevant.every((sm) => isSandaModality(sm.modality))
}
