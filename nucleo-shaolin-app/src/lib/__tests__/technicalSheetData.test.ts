import { describe, it, expect } from 'vitest'
import {
  getTechnicalSheetSchema,
  getTallyDisplay,
  FAIXA_LARANJA_SCHEMA,
  BELT_SCHEMAS,
} from '../technicalSheetData'

describe('technicalSheetData', () => {
  describe('getTechnicalSheetSchema', () => {
    it('returns FAIXA_LARANJA_SCHEMA for null or undefined', () => {
      expect(getTechnicalSheetSchema(null)).toEqual(FAIXA_LARANJA_SCHEMA)
      expect(getTechnicalSheetSchema(undefined)).toEqual(FAIXA_LARANJA_SCHEMA)
      expect(getTechnicalSheetSchema('')).toEqual(FAIXA_LARANJA_SCHEMA)
    })

    it('returns matching schema for "faixa-laranja" slug', () => {
      const schema = getTechnicalSheetSchema('faixa-laranja')
      expect(schema.beltSlug).toBe('faixa-laranja')
      expect(schema.beltName).toBe('FAIXA LARANJA')
    })

    it('handles uppercase or unformatted belt name "Faixa Laranja"', () => {
      const schema = getTechnicalSheetSchema('Faixa Laranja')
      expect(schema.beltSlug).toBe('faixa-laranja')
    })

    it('falls back to FAIXA_LARANJA_SCHEMA for unknown belts', () => {
      const schema = getTechnicalSheetSchema('faixa-desconhecida')
      expect(schema).toEqual(FAIXA_LARANJA_SCHEMA)
    })
  })

  describe('getTallyDisplay', () => {
    it('returns empty strokes for 0 repetitions', () => {
      const result = getTallyDisplay(0)
      expect(result).toEqual({ strokes: '', isComplete: false, label: '0/6' })
    })

    it('returns progressive vertical bars for 1 to 4 repetitions', () => {
      expect(getTallyDisplay(1)).toEqual({ strokes: '│', isComplete: false, label: '1/6' })
      expect(getTallyDisplay(2)).toEqual({ strokes: '││', isComplete: false, label: '2/6' })
      expect(getTallyDisplay(3)).toEqual({ strokes: '│││', isComplete: false, label: '3/6' })
      expect(getTallyDisplay(4)).toEqual({ strokes: '││││', isComplete: false, label: '4/6' })
    })

    it('returns tally gate (卌) for 5 repetitions', () => {
      const result = getTallyDisplay(5)
      expect(result).toEqual({ strokes: '卌', isComplete: false, label: '5/6' })
    })

    it('returns checkmark completed status for 6 repetitions', () => {
      const result = getTallyDisplay(6)
      expect(result).toEqual({ strokes: '✓ 6', isComplete: true, label: '6/6' })
    })

    it('clamps negative numbers to 0', () => {
      const result = getTallyDisplay(-3)
      expect(result).toEqual({ strokes: '', isComplete: false, label: '0/6' })
    })

    it('clamps numbers higher than 6 to 6', () => {
      const result = getTallyDisplay(10)
      expect(result).toEqual({ strokes: '✓ 6', isComplete: true, label: '6/6' })
    })
  })

  describe('FAIXA_LARANJA_SCHEMA integrity', () => {
    it('has both left (training) and right (exam) columns', () => {
      const leftCategories = FAIXA_LARANJA_SCHEMA.categories.filter((c) => c.column === 'left')
      const rightCategories = FAIXA_LARANJA_SCHEMA.categories.filter((c) => c.column === 'right')

      expect(leftCategories.length).toBeGreaterThan(0)
      expect(rightCategories.length).toBeGreaterThan(0)
    })

    it('contains mandatory categories: posturas, bloqueios, chutes, basicos, kati, etc.', () => {
      const categoryIds = FAIXA_LARANJA_SCHEMA.categories.map((c) => c.id)
      expect(categoryIds).toContain('posturas')
      expect(categoryIds).toContain('bloqueios_ataques')
      expect(categoryIds).toContain('chutes_frente')
      expect(categoryIds).toContain('basicos')
      expect(categoryIds).toContain('kati')
      expect(categoryIds).toContain('exame_fisica')
      expect(categoryIds).toContain('exame_tecnica')
    })

    it('every technical item has non-empty id, label, and maxReps = 6', () => {
      FAIXA_LARANJA_SCHEMA.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          expect(item.id).toBeTruthy()
          expect(item.label).toBeTruthy()
          expect(item.maxReps).toBe(6)
        })
      })
    })

    it('exam items in column right have type exam_check', () => {
      const rightCategories = FAIXA_LARANJA_SCHEMA.categories.filter((c) => c.column === 'right')
      rightCategories.forEach((cat) => {
        cat.items.forEach((item) => {
          expect(item.type).toBe('exam_check')
        })
      })
    })
  })
})
