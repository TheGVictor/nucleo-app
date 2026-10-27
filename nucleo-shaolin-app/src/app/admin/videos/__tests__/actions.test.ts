import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createVideoAction, updateVideoAction, deleteVideoAction } from '../actions'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock supabase server and admin clients
const mockGetUser = vi.fn()
const mockProfileSelect = vi.fn()
const mockGraduationSelect = vi.fn()
const mockVideoInsert = vi.fn()
const mockVideoUpdateEq = vi.fn()
const mockVideoDeleteEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: mockProfileSelect,
            }),
          }),
        }
      }
      if (table === 'graduations') {
        return {
          select: () => ({
            eq: () => ({
              single: mockGraduationSelect,
            }),
          }),
        }
      }
      if (table === 'videos') {
        return {
          insert: mockVideoInsert,
          update: () => ({
            eq: mockVideoUpdateEq,
          }),
          delete: () => ({
            eq: mockVideoDeleteEq,
          }),
        }
      }
      return {}
    },
  })),
}))

describe('admin/videos actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createVideoAction', () => {
    it('fails if user is not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } })

      const result = await createVideoAction({
        title: 'Kati Teste',
        videoUrl: 'https://youtube.com/watch?v=123',
        graduationId: 'grad-1',
        category: 'Katis',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Usuário não autenticado')
    })

    it('fails if user is a student (not instructor or admin)', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'student-id' } } })
      mockProfileSelect.mockResolvedValueOnce({ data: { role: 'student' } })

      const result = await createVideoAction({
        title: 'Kati Teste',
        videoUrl: 'https://youtube.com/watch?v=123',
        graduationId: 'grad-1',
        category: 'Katis',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Apenas instrutores e administradores podem gerenciar vídeos')
    })

    it('validates mandatory fields: title, videoUrl, graduationId, category', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-id' } } })
      mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } })

      // Missing title
      const resNoTitle = await createVideoAction({
        title: '',
        videoUrl: 'https://youtube.com',
        graduationId: 'grad-1',
        category: 'Katis',
      })
      expect(resNoTitle.success).toBe(false)
      expect(resNoTitle.error).toBe('O título do vídeo é obrigatório')

      // Missing URL
      const resNoUrl = await createVideoAction({
        title: 'Kati 1',
        videoUrl: '',
        graduationId: 'grad-1',
        category: 'Katis',
      })
      expect(resNoUrl.success).toBe(false)
      expect(resNoUrl.error).toBe('A URL do vídeo é obrigatória')

      // Missing graduationId
      const resNoGrad = await createVideoAction({
        title: 'Kati 1',
        videoUrl: 'https://youtube.com',
        graduationId: '',
        category: 'Katis',
      })
      expect(resNoGrad.success).toBe(false)
      expect(resNoGrad.error).toBe('Selecione a faixa associada')
    })

    it('successfully creates video and formats embed URL', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-id' } } })
      mockProfileSelect.mockResolvedValueOnce({ data: { role: 'instructor' } })
      mockGraduationSelect.mockResolvedValueOnce({ data: { modality_id: 'mod-clf' } })

      mockVideoInsert.mockReturnValueOnce({
        select: () => ({
          single: vi.fn().mockResolvedValueOnce({ data: { id: 'video-123' }, error: null }),
        }),
      })

      const result = await createVideoAction({
        title: 'Kati Ng Lun Choi',
        videoUrl: 'https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/view?usp=drive_link',
        graduationId: 'grad-laranja',
        category: 'Katis',
        durationMinutes: 4,
      })

      expect(result.success).toBe(true)
      expect(result.videoId).toBe('video-123')
      expect(mockVideoInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Kati Ng Lun Choi',
          video_url: 'https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/preview',
          duration_seconds: 240,
          category: 'Katis',
        })
      )
    })
  })

  describe('updateVideoAction', () => {
    it('validates required fields on update', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-id' } } })
      mockProfileSelect.mockResolvedValue({ data: { role: 'admin' } })

      const res = await updateVideoAction('v-1', {
        title: '',
        videoUrl: 'https://youtube.com',
        graduationId: 'g-1',
        category: 'Katis',
      })
      expect(res.success).toBe(false)
      expect(res.error).toBe('O título do vídeo é obrigatório')
    })

    it('successfully updates video data and converts URL', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-id' } } })
      mockProfileSelect.mockResolvedValueOnce({ data: { role: 'admin' } })
      mockVideoUpdateEq.mockResolvedValueOnce({ error: null })

      const res = await updateVideoAction('v-1', {
        title: 'Título Atualizado',
        videoUrl: 'https://youtube.com/watch?v=new123',
        graduationId: 'g-2',
        category: 'Chutes',
      })

      expect(res.success).toBe(true)
      expect(mockVideoUpdateEq).toHaveBeenCalledWith('id', 'v-1')
    })
  })

  describe('deleteVideoAction', () => {
    it('deletes video when called by admin', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-id' } } })
      mockProfileSelect.mockResolvedValueOnce({ data: { role: 'admin' } })
      mockVideoDeleteEq.mockResolvedValueOnce({ error: null })

      const res = await deleteVideoAction('v-to-delete')
      expect(res.success).toBe(true)
      expect(mockVideoDeleteEq).toHaveBeenCalledWith('id', 'v-to-delete')
    })

    it('handles delete error gracefully', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-id' } } })
      mockProfileSelect.mockResolvedValueOnce({ data: { role: 'admin' } })
      mockVideoDeleteEq.mockResolvedValueOnce({ error: { message: 'Database constraint error' } })

      const res = await deleteVideoAction('v-to-delete')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Database constraint error')
    })
  })
})
