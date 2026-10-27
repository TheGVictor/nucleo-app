import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VideosExplorer, BELT_HIERARCHY, type VideoItem } from '../VideosExplorer'

describe('VideosExplorer & Belt Hierarchy', () => {
  describe('BELT_HIERARCHY configuration', () => {
    it('has 10 official belts ordered from 1 (Branca) to 10 (Preta)', () => {
      expect(BELT_HIERARCHY).toHaveLength(10)
      expect(BELT_HIERARCHY[0].name).toBe('Faixa Branca')
      expect(BELT_HIERARCHY[0].order).toBe(1)

      expect(BELT_HIERARCHY[9].name).toBe('Faixa Preta')
      expect(BELT_HIERARCHY[9].order).toBe(10)
    })

    it('all belt orders are strictly sequential without gaps', () => {
      BELT_HIERARCHY.forEach((belt, idx) => {
        expect(belt.order).toBe(idx + 1)
        expect(belt.color).toMatch(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
      })
    })
  })

  describe('Component Rendering & Business Rules', () => {
    const mockVideos: VideoItem[] = [
      {
        id: 'v1',
        title: 'Soco Básico Faixa Branca',
        category: 'Ataques',
        belt: 'Faixa Branca',
        beltOrder: 1,
        description: null,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        id: 'v2',
        title: 'Bloqueio Básico Faixa Branca',
        category: 'Bloqueios',
        belt: 'Faixa Branca',
        beltOrder: 1,
        description: null,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        id: 'v3',
        title: 'Chute Frontal Amarela',
        category: 'Chutes',
        belt: 'Faixa Amarela',
        beltOrder: 2,
        description: null,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        id: 'v4',
        title: 'Kati Amarela (Ng Lun Choi)',
        category: 'Katis',
        belt: 'Faixa Amarela',
        beltOrder: 2,
        description: null,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        id: 'v5',
        title: 'Kati Laranja (Tuet Jin Kuen)',
        category: 'Katis',
        belt: 'Faixa Laranja',
        beltOrder: 3,
        description: null,
        video_url: 'https://drive.google.com/file/d/171gDdGH9G_lunOQ0N5-xIHhG4W3y5zox/preview',
      },
      {
        id: 'v6',
        title: 'Kati Roxa Avançada',
        category: 'Katis',
        belt: 'Faixa Roxa',
        beltOrder: 6,
        description: null,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    ]

    it('White belt student receives white belt categories (Ataques, Bloqueios, Defesa Pessoal, Básicos) without Katis tab', () => {
      render(<VideosExplorer initialVideos={mockVideos} studentCurrentBelt="Faixa Branca" />)

      expect(screen.getByRole('button', { name: 'Ataques' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Bloqueios' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Defesa Pessoal' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Básicos' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Katis' })).not.toBeInTheDocument()
    })

    it('Colored belt student (Laranja) receives colored categories (Básicos, Chutes, Aplicações, Katis)', () => {
      render(<VideosExplorer initialVideos={mockVideos} studentCurrentBelt="Faixa Laranja" />)

      expect(screen.getByRole('button', { name: 'Básicos' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Chutes' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Aplicações' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Katis' })).toBeInTheDocument()
    })

    it('Kati cumulative rule: Laranja student can see Katis of current belt and lower, but NOT higher (Roxa)', () => {
      render(<VideosExplorer initialVideos={mockVideos} studentCurrentBelt="Faixa Laranja" />)

      // Click on Katis category
      fireEvent.click(screen.getByRole('button', { name: 'Katis' }))

      // Amarela (order 2) and Laranja (order 3) should be visible
      expect(screen.getByText('Kati Amarela (Ng Lun Choi)')).toBeInTheDocument()
      expect(screen.getByText('Kati Laranja (Tuet Jin Kuen)')).toBeInTheDocument()

      // Roxa (order 6) must NOT be visible
      expect(screen.queryByText('Kati Roxa Avançada')).not.toBeInTheDocument()
    })
  })
})
