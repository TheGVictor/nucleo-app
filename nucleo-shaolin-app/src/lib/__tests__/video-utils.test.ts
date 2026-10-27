import { describe, it, expect } from 'vitest'
import { formatEmbedUrl } from '../video-utils'

describe('video-utils: formatEmbedUrl', () => {
  describe('Google Drive URLs', () => {
    it('converts standard share /view URL to /preview', () => {
      const input = 'https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/view?usp=drive_link'
      const output = formatEmbedUrl(input)
      expect(output).toBe('https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/preview')
    })

    it('converts basic /view URL to /preview', () => {
      const input = 'https://drive.google.com/file/d/abc123XYZ_file/view'
      const output = formatEmbedUrl(input)
      expect(output).toBe('https://drive.google.com/file/d/abc123XYZ_file/preview')
    })

    it('converts open?id= format to /preview', () => {
      const input = 'https://drive.google.com/open?id=171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox'
      const output = formatEmbedUrl(input)
      expect(output).toBe('https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/preview')
    })

    it('maintains existing /preview URLs intact', () => {
      const input = 'https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/preview'
      const output = formatEmbedUrl(input)
      expect(output).toBe('https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/preview')
    })
  })

  describe('YouTube URLs', () => {
    it('converts youtube.com/watch?v=ID to embed URL with modest params', () => {
      const input = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      const output = formatEmbedUrl(input)
      expect(output).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(output).toContain('modestbranding=1')
      expect(output).toContain('rel=0')
      expect(output).toContain('playsinline=1')
    })

    it('converts youtu.be/ID short link to embed URL', () => {
      const input = 'https://youtu.be/dQw4w9WgXcQ'
      const output = formatEmbedUrl(input)
      expect(output).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(output).toContain('modestbranding=1')
    })

    it('converts youtube.com/shorts/ID to embed URL', () => {
      const input = 'https://www.youtube.com/shorts/dQw4w9WgXcQ'
      const output = formatEmbedUrl(input)
      expect(output).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(output).toContain('modestbranding=1')
    })

    it('appends parameters to existing embed URL without duplicating', () => {
      const input = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      const output = formatEmbedUrl(input)
      expect(output).toContain('modestbranding=1')
      // If already has modestbranding, it shouldn't add it twice
      const secondPass = formatEmbedUrl(output)
      expect(secondPass.match(/modestbranding=1/g)?.length).toBe(1)
    })
  })

  describe('Vimeo URLs', () => {
    it('converts vimeo.com/ID to player.vimeo.com/video/ID', () => {
      const input = 'https://vimeo.com/123456789'
      const output = formatEmbedUrl(input)
      expect(output).toBe('https://player.vimeo.com/video/123456789')
    })

    it('keeps existing player.vimeo.com URL intact', () => {
      const input = 'https://player.vimeo.com/video/123456789'
      const output = formatEmbedUrl(input)
      expect(output).toBe('https://player.vimeo.com/video/123456789')
    })
  })

  describe('Edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(formatEmbedUrl('')).toBe('')
      expect(formatEmbedUrl('   ')).toBe('')
    })

    it('returns unrecognized URLs trimmed without alteration', () => {
      const input = '  https://custom-server.com/my-video.mp4  '
      expect(formatEmbedUrl(input)).toBe('https://custom-server.com/my-video.mp4')
    })
  })
})
