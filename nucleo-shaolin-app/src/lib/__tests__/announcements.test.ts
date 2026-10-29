import { describe, it, expect } from 'vitest'
import {
  parseAnnouncementContent,
  buildAnnouncementContent,
  filterStudentAnnouncements,
} from '../announcements'

describe('announcements utility', () => {
  describe('parseAnnouncementContent', () => {
    it('returns empty text and null image for null, undefined or empty strings', () => {
      expect(parseAnnouncementContent(null)).toEqual({ text: '', imageUrl: null })
      expect(parseAnnouncementContent(undefined)).toEqual({ text: '', imageUrl: null })
      expect(parseAnnouncementContent('')).toEqual({ text: '', imageUrl: null })
      expect(parseAnnouncementContent('   ')).toEqual({ text: '', imageUrl: null })
    })

    it('parses structured JSON envelope with image and targeted student IDs', () => {
      const json = JSON.stringify({
        text: 'Aviso exclusivo para exame de faixa',
        imageUrl: 'https://supabase.co/storage/v1/object/banner.jpg',
        targetStudentIds: ['uuid-1', 'uuid-2'],
        targetStudentNames: ['João Silva', 'Maria Souza'],
      })

      const parsed = parseAnnouncementContent(json)
      expect(parsed.text).toBe('Aviso exclusivo para exame de faixa')
      expect(parsed.imageUrl).toBe('https://supabase.co/storage/v1/object/banner.jpg')
      expect(parsed.targetStudentIds).toEqual(['uuid-1', 'uuid-2'])
      expect(parsed.targetStudentNames).toEqual(['João Silva', 'Maria Souza'])
    })

    it('parses [IMAGE]:URL marker format with optional description', () => {
      const marker = '[IMAGE]:https://example.com/banner.png\n\nTreino especial de sábado às 10h'
      const parsed = parseAnnouncementContent(marker)
      expect(parsed.imageUrl).toBe('https://example.com/banner.png')
      expect(parsed.text).toBe('Treino especial de sábado às 10h')
    })

    it('parses [IMAGE]:URL with no extra text', () => {
      const marker = '[IMAGE]:https://example.com/banner.png'
      const parsed = parseAnnouncementContent(marker)
      expect(parsed.imageUrl).toBe('https://example.com/banner.png')
      expect(parsed.text).toBe('')
    })

    it('identifies pure image URLs as images without text', () => {
      const imageUrl = 'https://example.com/uploads/photo.jpg'
      const parsed = parseAnnouncementContent(imageUrl)
      expect(parsed.imageUrl).toBe(imageUrl)
      expect(parsed.text).toBe('')
    })

    it('treats regular text as plain message description', () => {
      const message = 'Atenção alunos: amanhã feriado, academia fechada.'
      const parsed = parseAnnouncementContent(message)
      expect(parsed.text).toBe(message)
      expect(parsed.imageUrl).toBeNull()
    })
  })

  describe('buildAnnouncementContent', () => {
    it('builds structured JSON string when targetStudentIds are provided', () => {
      const output = buildAnnouncementContent(
        'Mensagem privada',
        'https://example.com/pic.png',
        ['id-1'],
        ['Gabriel']
      )

      const parsed = JSON.parse(output)
      expect(parsed.text).toBe('Mensagem privada')
      expect(parsed.imageUrl).toBe('https://example.com/pic.png')
      expect(parsed.targetStudentIds).toEqual(['id-1'])
      expect(parsed.targetStudentNames).toEqual(['Gabriel'])
    })

    it('builds [IMAGE]:url when only image is provided', () => {
      const output = buildAnnouncementContent('', 'https://example.com/pic.png')
      expect(output).toBe('[IMAGE]:https://example.com/pic.png')
    })

    it('builds [IMAGE]:url\\n\\ntext when both image and text are provided without targeted students', () => {
      const output = buildAnnouncementContent('Texto do aviso', 'https://example.com/pic.png')
      expect(output).toBe('[IMAGE]:https://example.com/pic.png\n\nTexto do aviso')
    })

    it('returns clean plain text when no image and no targeted students are given', () => {
      const output = buildAnnouncementContent('  Apenas texto do aviso  ', null)
      expect(output).toBe('Apenas texto do aviso')
    })
  })

  describe('filterStudentAnnouncements', () => {
    it('filters general, modality-matched, and targeted announcements accurately', () => {
      const all = [
        { id: '1', title: 'Aviso Geral', content: 'Texto', category: 'Aviso', modality_id: null },
        { id: '2', title: 'Aviso Sanda', content: 'Treino', category: 'Aviso', modality_id: 'mod-sanda' },
        { id: '3', title: 'Aviso Tai Chi', content: 'Treino', category: 'Aviso', modality_id: 'mod-taichi' },
        {
          id: '4',
          title: 'Grupo Exame',
          content: JSON.stringify({ text: 'Exame', targetStudentIds: ['u-1'] }),
          category: 'Exame',
          modality_id: null,
        },
        {
          id: '5',
          title: 'Outro Grupo',
          content: JSON.stringify({ text: 'Exame', targetStudentIds: ['u-99'] }),
          category: 'Exame',
          modality_id: null,
        },
      ]

      const filtered = filterStudentAnnouncements(all, 'u-1', 'Thiago Augusto', ['mod-sanda'])
      expect(filtered.map((a) => a.id)).toEqual(['1', '2', '4'])
    })
  })
})
