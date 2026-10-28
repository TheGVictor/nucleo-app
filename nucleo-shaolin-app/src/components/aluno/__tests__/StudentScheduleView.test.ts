import { describe, it, expect } from 'vitest'
import {
  determineStudentCategory,
  matchesStudentSchedule,
} from '../StudentScheduleView'

describe('StudentScheduleView - Category Determination', () => {
  it('identifies student as kids if guardian_name is present', () => {
    const res = determineStudentCategory('2005-01-01', 'Maria da Silva', 1)
    expect(res.category).toBe('kids')
    expect(res.label).toContain('Kids')
  })

  it('identifies student as kids if age is under 14', () => {
    // 8 years old
    const res = determineStudentCategory('2018-06-15', null, 1)
    expect(res.category).toBe('kids')
  })

  it('identifies adult as iniciante if level_order <= 8', () => {
    // 25 years old, Marrom Clara (order 8)
    const res = determineStudentCategory('2001-01-01', null, 8)
    expect(res.category).toBe('iniciante')
    expect(res.label).toContain('Iniciante')
  })

  it('identifies adult as avancado if level_order is 9', () => {
    // 30 years old, Marrom Avançada (order 9)
    const res = determineStudentCategory('1996-01-01', null, 9)
    expect(res.category).toBe('avancado')
    expect(res.label).toContain('Avançado')
  })

  it('identifies adult as preta if level_order >= 10', () => {
    // 35 years old, Faixa Preta (order 10)
    const res = determineStudentCategory('1991-01-01', null, 10)
    expect(res.category).toBe('preta')
    expect(res.label).toContain('Faixa Preta')
  })
})

describe('StudentScheduleView - Schedule Matching', () => {
  const dummySchedule = (title: string, modSlug: string = 'clf') => ({
    id: 'test-1',
    title,
    day_of_week: 1,
    start_time: '18:00:00',
    end_time: '19:00:00',
    modality_id: 'mod-1',
    active: true,
    created_at: '',
    modality: { id: 'mod-1', name: 'Kung Fu', slug: modSlug },
  })

  it('matches iniciante schedules only for iniciantes', () => {
    const s = dummySchedule('Iniciantes e Intermediário (até marrom-clara) Adulto')
    expect(matchesStudentSchedule(s, 'iniciante', false, false)).toBe(true)
    expect(matchesStudentSchedule(s, 'kids', false, false)).toBe(false)
    expect(matchesStudentSchedule(s, 'avancado', false, false)).toBe(false)
  })

  it('matches kids schedules only for kids', () => {
    const s1 = dummySchedule('Crianças Siu Lung e Kids')
    const s2 = dummySchedule('Kids')
    expect(matchesStudentSchedule(s1, 'kids', false, false)).toBe(true)
    expect(matchesStudentSchedule(s2, 'kids', false, false)).toBe(true)
    expect(matchesStudentSchedule(s1, 'iniciante', false, false)).toBe(false)
  })

  it('matches avancado schedules for avancado and preta', () => {
    const s = dummySchedule('Avançado (marrom escura em diante) Adulto')
    expect(matchesStudentSchedule(s, 'avancado', false, false)).toBe(true)
    expect(matchesStudentSchedule(s, 'preta', false, false)).toBe(true)
    expect(matchesStudentSchedule(s, 'iniciante', false, false)).toBe(false)
    expect(matchesStudentSchedule(s, 'kids', false, false)).toBe(false)
  })

  it('matches faixas pretas schedules only for preta', () => {
    const s = dummySchedule('Faixa Preta em diante')
    expect(matchesStudentSchedule(s, 'preta', false, false)).toBe(true)
    expect(matchesStudentSchedule(s, 'avancado', false, false)).toBe(false)
    expect(matchesStudentSchedule(s, 'iniciante', false, false)).toBe(false)
  })

  it('matches tai chi only if student is enrolled in tai chi', () => {
    const s = dummySchedule('Tai Chi', 'taichi')
    expect(matchesStudentSchedule(s, 'iniciante', true, false)).toBe(true)
    expect(matchesStudentSchedule(s, 'iniciante', false, false)).toBe(false)
  })

  it('matches sanda only if student is enrolled in sanda', () => {
    const s = dummySchedule('Sanda', 'sanda')
    expect(matchesStudentSchedule(s, 'iniciante', false, true)).toBe(true)
    expect(matchesStudentSchedule(s, 'iniciante', false, false)).toBe(false)
  })

  it('matches special classes for all students', () => {
    const s = dummySchedule('Aula especial de kati')
    expect(matchesStudentSchedule(s, 'iniciante', false, false)).toBe(true)
    expect(matchesStudentSchedule(s, 'kids', false, false)).toBe(true)
  })
})
