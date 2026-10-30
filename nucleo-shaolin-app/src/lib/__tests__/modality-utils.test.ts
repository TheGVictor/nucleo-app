import { describe, it, expect } from 'vitest'
import {
  normalizeTonLong,
  isSandaModality,
  isTaiChiModality,
  modalityHasFicha,
  modalityHasVideos,
  studentHasFicha,
  studentHasVideos,
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

describe('modality rules for Sanda and Tai Chi', () => {
  it('identifies Sanda and Tai Chi modalities', () => {
    expect(isSandaModality({ slug: 'sanda', name: 'Sanda' })).toBe(true)
    expect(isTaiChiModality({ slug: 'taichi', name: 'Tai Chi Chuan' })).toBe(true)
    expect(isTaiChiModality({ slug: 'clf', name: 'Kung Fu Choy Lay Fut' })).toBe(false)
  })

  it('enforces that Sanda has neither Ficha nor Videos', () => {
    const sanda = [{ status: 'active', modality: { slug: 'sanda', name: 'Sanda' } }]
    expect(isOnlySandaStudent(sanda)).toBe(true)
    expect(studentHasFicha(sanda)).toBe(false)
    expect(studentHasVideos(sanda)).toBe(false)
  })

  it('enforces that Tai Chi has Videos but NO Ficha', () => {
    const taichi = [{ status: 'active', modality: { slug: 'taichi', name: 'Tai Chi Chuan' } }]
    expect(modalityHasFicha(taichi[0].modality)).toBe(false)
    expect(modalityHasVideos(taichi[0].modality)).toBe(true)
    expect(studentHasFicha(taichi)).toBe(false)
    expect(studentHasVideos(taichi)).toBe(true)
  })

  it('enforces that Sanda + Tai Chi has Videos but NO Ficha', () => {
    const sandaAndTaichi = [
      { status: 'active', modality: { slug: 'sanda', name: 'Sanda' } },
      { status: 'active', modality: { slug: 'taichi', name: 'Tai Chi Chuan' } },
    ]
    expect(studentHasFicha(sandaAndTaichi)).toBe(false)
    expect(studentHasVideos(sandaAndTaichi)).toBe(true)
  })

  it('enforces that Choy Lay Fut has both Ficha and Videos', () => {
    const clf = [{ status: 'active', modality: { slug: 'clf', name: 'Kung Fu Choy Lay Fut' } }]
    expect(studentHasFicha(clf)).toBe(true)
    expect(studentHasVideos(clf)).toBe(true)
  })
})
