export interface ParsedAnnouncementContent {
  text: string
  imageUrl: string | null
  targetStudentIds?: string[]
  targetStudentNames?: string[]
}

/**
 * Faz o parse do conteúdo de um aviso, identificando se contém uma imagem,
 * ou destinatários específicos de um grupo de alunos.
 */
export function parseAnnouncementContent(
  content: string | null | undefined
): ParsedAnnouncementContent {
  if (!content) return { text: '', imageUrl: null }

  const trimmed = content.trim()

  // Caso 1: Objeto JSON estruturado (com imagem e/ou alunos específicos)
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      return {
        imageUrl: parsed.imageUrl || parsed.image_url || null,
        text: parsed.text || parsed.content || '',
        targetStudentIds: Array.isArray(parsed.targetStudentIds)
          ? parsed.targetStudentIds
          : undefined,
        targetStudentNames: Array.isArray(parsed.targetStudentNames)
          ? parsed.targetStudentNames
          : undefined,
      }
    } catch {}
  }

  // Caso 2: Marcador explícito [IMAGE]:URL\n\ntexto opcional
  if (trimmed.startsWith('[IMAGE]:')) {
    const withoutPrefix = trimmed.replace('[IMAGE]:', '').trim()
    const parts = withoutPrefix.split('\n\n')
    const imageUrl = parts[0]?.trim() || null
    const text = parts.slice(1).join('\n\n').trim()
    return { text, imageUrl }
  }

  // Caso 3: URL de imagem pura (sem texto, apenas imagem)
  if (
    (trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:image/')) &&
    !trimmed.includes(' ') &&
    (trimmed.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) ||
      trimmed.includes('/storage/v1/object/'))
  ) {
    return { text: '', imageUrl: trimmed }
  }

  // Caso 4: Descrição textual tradicional
  return { text: trimmed, imageUrl: null }
}

/**
 * Constrói a string de conteúdo unificada para persistência no banco de dados.
 */
export function buildAnnouncementContent(
  text: string,
  imageUrl: string | null | undefined,
  targetStudentIds?: string[],
  targetStudentNames?: string[]
): string {
  const cleanImage = imageUrl?.trim() || null
  const cleanText = text?.trim() || ''

  // Se houver alunos específicos selecionados, salva como envelope JSON estruturado
  if (targetStudentIds && targetStudentIds.length > 0) {
    return JSON.stringify({
      text: cleanText,
      imageUrl: cleanImage,
      targetStudentIds,
      targetStudentNames: targetStudentNames || [],
    })
  }

  if (cleanImage && !cleanText) {
    return `[IMAGE]:${cleanImage}`
  }

  if (cleanImage && cleanText) {
    return `[IMAGE]:${cleanImage}\n\n${cleanText}`
  }

  return cleanText
}
