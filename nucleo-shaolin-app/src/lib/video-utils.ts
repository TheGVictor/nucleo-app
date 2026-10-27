/**
 * Utilitários para formatação e manipulação de URLs de vídeo (YouTube, Vimeo, Google Drive, etc.)
 * Configura parâmetros para embutir corretamente os players em web e mobile.
 */
export function formatEmbedUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  const trimmed = rawUrl.trim()

  // ── GOOGLE DRIVE ──────────────────────────────────────────────
  // Transforma links de compartilhamento padrão /view em /preview (modo embed)
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`
  }

  const driveIdMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`
  }

  // ── YOUTUBE ───────────────────────────────────────────────────
  const ytParams = 'modestbranding=1&rel=0&iv_load_policy=3&playsinline=1'

  function withYtParams(url: string) {
    if (url.includes('modestbranding')) return url
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${ytParams}`
  }

  // Se já for uma URL de embed do YouTube
  if (trimmed.includes('youtube.com/embed/')) {
    return withYtParams(trimmed)
  }

  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
  if (shortsMatch && shortsMatch[1]) {
    return withYtParams(`https://www.youtube.com/embed/${shortsMatch[1]}`)
  }

  // YouTube Padrão: https://www.youtube.com/watch?v=VIDEO_ID
  const ytWatchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (ytWatchMatch && ytWatchMatch[1]) {
    return withYtParams(`https://www.youtube.com/embed/${ytWatchMatch[1]}`)
  }

  // YouTube Curto: https://youtu.be/VIDEO_ID
  const ytShortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (ytShortMatch && ytShortMatch[1]) {
    return withYtParams(`https://www.youtube.com/embed/${ytShortMatch[1]}`)
  }

  // ── VIMEO ─────────────────────────────────────────────────────
  if (trimmed.includes('player.vimeo.com/video/')) {
    return trimmed
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return trimmed
}
