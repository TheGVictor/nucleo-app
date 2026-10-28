import { describe, it, expect } from 'vitest'
import { normalizeTonLong } from '../modality-utils'

describe('normalizeTonLong', () => {
  it('converts TanLang and Tang Lang variations to Ton Long', () => {
    expect(normalizeTonLong('TanLang')).toBe('Ton Long')
    expect(normalizeTonLong('Tan Lang')).toBe('Ton Long')
    expect(normalizeTonLong('Tang Lang')).toBe('Ton Long')
    expect(normalizeTonLong('TangLang')).toBe('Ton Long')
    expect(normalizeTonLong('Aula de tanlang avançado')).toBe('Aula de Ton Long avançado')
  })

  it('preserves other modality names untouched', () => {
    expect(normalizeTonLong('Choy Lay Fut')).toBe('Choy Lay Fut')
    expect(normalizeTonLong('Tai Chi Chuan')).toBe('Tai Chi Chuan')
    expect(normalizeTonLong('Sanda')).toBe('Sanda')
    expect(normalizeTonLong('Ton Long')).toBe('Ton Long')
  })
})

