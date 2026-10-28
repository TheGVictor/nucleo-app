import { describe, it, expect } from 'vitest'
import { getBeltTheme } from '../beltTheme'

describe('beltTheme utility', () => {
  it('handles Faixa Preta correctly with prestigious gold & onyx contrast', () => {
    const theme = getBeltTheme('Faixa Preta', '#1A1A1A')
    expect(theme.isPreta).toBe(true)
    expect(theme.isBranca).toBe(false)
    expect(theme.accentColor).toBe('#D4AF37')
    expect(theme.badgeBg).toBe('#141414')
    expect(theme.badgeText).toBe('#FDE047')
    expect(theme.borderLeft).toContain('#D4AF37')
  })

  it('handles Faixa Preta Graus with black belt rules', () => {
    const theme = getBeltTheme('Faixa Preta 2º Grau', '#000000')
    expect(theme.isPreta).toBe(true)
    expect(theme.badgeText).toBe('#FDE047')
  })

  it('handles Faixa Branca with clean borders and contrast', () => {
    const theme = getBeltTheme('Faixa Branca', '#E2E8F0')
    expect(theme.isBranca).toBe(true)
    expect(theme.isPreta).toBe(false)
    expect(theme.badgeBorder).toBe('var(--color-border)')
    expect(theme.badgeText).toBe('var(--color-text)')
    expect(theme.borderLeft).toContain('#CBD5E1')
  })

  it('handles Faixa Amarela with high readability', () => {
    const theme = getBeltTheme('Faixa Amarela', '#FFD700')
    expect(theme.isPreta).toBe(false)
    expect(theme.isBranca).toBe(false)
    expect(theme.badgeText).toBe('var(--color-text)')
    expect(theme.accentColor).toBe('#F59E0B')
  })

  it('handles all standard colored belts without text conflict', () => {
    const belts = [
      { name: 'Faixa Laranja', color: '#FF8C00' },
      { name: 'Faixa Verde-Jade', color: '#00A86B' },
      { name: 'Faixa Verde Escura', color: '#006400' },
      { name: 'Faixa Roxa', color: '#800080' },
      { name: 'Faixa Vermelha', color: '#DC143C' },
      { name: 'Faixa Marrom-Clara', color: '#C4A35A' },
      { name: 'Faixa Marrom-Avançada', color: '#8B4513' },
    ]

    belts.forEach(({ name, color }) => {
      const theme = getBeltTheme(name, color)
      expect(theme.isPreta).toBe(false)
      expect(theme.isBranca).toBe(false)
      expect(theme.label).toBe(name)
      expect(theme.badgeText).toBe('var(--color-text)')
      expect(theme.dotColor).toBe(color)
      expect(theme.borderLeft).toBe(`6px solid ${color}`)
    })
  })

  it('handles null and undefined gracefully', () => {
    const theme = getBeltTheme(null, null)
    expect(theme.label).toBe('Graduação Oficial')
    expect(theme.badgeText).toBe('var(--color-text)')
  })
})
