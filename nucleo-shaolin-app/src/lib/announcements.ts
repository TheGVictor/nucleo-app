export interface ParsedAnnouncementContent {
  text: string
  imageUrl: string | null
}

/**
 * Faz o parse do conteúdo de um aviso, identificando se contém uma imagem
 * (usada ao invés de descrição ou em conjunto com a descrição).
 */
export function parseAnnouncementContent(content: string | null | undefined): ParsedAnnouncementContent {
  if (!content) return { text: '', imageUrl: null }

  const trimmed = content.trim()

  // Caso 1: Marcador explícito [IMAGE]:URL\n\ntexto opcional
  if (trimmed.startsWith('[IMAGE]:')) {
    const withoutPrefix = trimmed.replace('[IMAGE]:', '').trim()
    const parts = withoutPrefix.split('\n\n')
    const imageUrl = parts[0]?.trim() || null
    const text = parts.slice(1).join('\n\n').trim()
    return { text, imageUrl }
  }

  // Caso 2: Objeto JSON estruturado
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.imageUrl || parsed.image_url) {
        return {
          imageUrl: parsed.imageUrl || parsed.image_url || null,
          text: parsed.text || parsed.content || '',
        }
      }
    } catch {}
  }

  // Caso 3: URL de imagem pura (sem texto, apenas imagem)
  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) &&
    !trimmed.includes(' ') &&
    (trimmed.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || trimmed.includes('/storage/v1/object/'))
  ) {
    return { text: '', imageUrl: trimmed }
  }

  // Caso 4: Descrição textual tradicional
  return { text: trimmed, imageUrl: null }
}

/**
 * Constrói a string de conteúdo unificada para persistência no banco de dados.
 */
export function buildAnnouncementContent(text: string, imageUrl: string | null | undefined): string {
  const cleanImage = imageUrl?.trim() || null
  const cleanText = text?.trim() || ''

  if (cleanImage && !cleanText) {
    return `[IMAGE]:${cleanImage}`
  }

  if (cleanImage && cleanText) {
    return `[IMAGE]:${cleanImage}\n\n${cleanText}`
  }

  return cleanText
}
