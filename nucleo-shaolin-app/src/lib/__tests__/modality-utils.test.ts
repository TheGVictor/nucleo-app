import { describe, it, expect } from 'vitest'
import {
  normalizeTonLong,
  isSandaModality,
  isOnlySandaStudent,
} from '../modality-utils'

describe('normalizeTonLong', () => {
  it('converts TanLang and Tang Lang variations to Ton Long', () => {
    expect(normalizeTonLong('TanLang')).toBe('Ton Long')
    expect(normalizeTonLong('tanlang')).toBe('Ton Long')
    expect(normalizeTonLong('Tan Lang')).toBe('Ton Long')
    expect(normalizeTonLong('Tang Lang')).toBe('Ton Long')
    expect(normalizeTonLong('TangLang')).toBe('Ton Long')
    expect(normalizeTonLong('Aula de TanLang Avançado')).toBe('Aula de Ton Long Avançado')
  })

  it('returns empty string for null or undefined', () => {
    expect(normalizeTonLong(null)).toBe('')
    expect(normalizeTonLong(undefined)).toBe('')
  })

  it('preserves unrelated modality names', () => {
    expect(normalizeTonLong('Kung Fu Choy Lay Fut')).toBe('Kung Fu Choy Lay Fut')
    expect(normalizeTonLong('Ton Long')).toBe('Ton Long')
  })
})

describe('isSandaModality & isOnlySandaStudent', () => {
  it('identifies Sanda modality by slug or name', () => {
    expect(isSandaModality({ slug: 'sanda', name: 'Sanda' })).toBe(true)
    expect(isSandaModality({ slug: 'boxe', name: 'Sanda / Boxe Chinês' })).toBe(true)
    expect(isSandaModality({ slug: 'clf', name: 'Kung Fu Choy Lay Fut' })).toBe(false)
    expect(isSandaModality(null)).toBe(false)
  })

  it('returns true only when student practices exclusively Sanda', () => {
    expect(
      isOnlySandaStudent([
        { status: 'active', modality: { slug: 'sanda', name: 'Sanda' } },
      ])
    ).toBe(true)

    expect(
      isOnlySandaStudent([
        { status: 'active', modality: { slug: 'sanda', name: 'Sanda' } },
        { status: 'active', modality: { slug: 'clf', name: 'Kung Fu Choy Lay Fut' } },
      ])
    ).toBe(false)

    expect(
      isOnlySandaStudent([
        { status: 'active', modality: { slug: 'clf', name: 'Kung Fu Choy Lay Fut' } },
      ])
    ).toBe(false)

    expect(isOnlySandaStudent([])).toBe(false)
    expect(isOnlySandaStudent(null)).toBe(false)
  })
})
