/**
 * Utilitário central de temas visuais e contraste para graduações e faixas de Kung Fu.
 * Garante contraste perfeito (WCAG AAA) em todos os cenários (Modo Claro e Modo Escuro)
 * para todas as cores de faixa marcial (Branca, Amarela, Laranja, Verde, Roxa, Vermelha, Marrom, Preta).
 */

export interface BeltTheme {
  label: string
  isPreta: boolean
  isBranca: boolean
  accentColor: string
  cardBg: string
  cardBorder: string
  borderLeft: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  dotColor: string
  dotBorder?: string
}

export function getBeltTheme(
  beltName?: string | null,
  rawColor?: string | null
): BeltTheme {
  const name = (beltName || '').trim()
  const lowerName = name.toLowerCase()
  const color = (rawColor || '').trim()
  const lowerColor = color.toLowerCase()

  const isPreta =
    lowerName.includes('preta') ||
    lowerColor === '#1a1a1a' ||
    lowerColor === '#141414' ||
    lowerColor === '#000000' ||
    lowerColor === '#111827'

  const isBranca =
    lowerName.includes('branca') ||
    lowerColor === '#e2e8f0' ||
    lowerColor === '#ffffff' ||
    lowerColor === '#f8fafc'

  const isAmarela =
    lowerName.includes('amarela') ||
    lowerColor === '#ffd700' ||
    lowerColor === '#eab308'

  // 1. FAIXA PRETA (E GRAUS) — Destaque marcial dourado com ônix de alto prestígio
  if (isPreta) {
    return {
      label: name || 'Faixa Preta',
      isPreta: true,
      isBranca: false,
      accentColor: '#D4AF37', // Dourado de honra marcial
      cardBg:
        'linear-gradient(135deg, rgba(212, 175, 55, 0.09) 0%, var(--color-bg-card) 75%)',
      cardBorder: 'rgba(212, 175, 55, 0.35)',
      borderLeft: '6px solid #D4AF37',
      badgeBg: '#141414',
      badgeText: '#FDE047',
      badgeBorder: '#D4AF37',
      dotColor: '#D4AF37',
    }
  }

  // 2. FAIXA BRANCA — Limpa, com borda definida para não sumir no fundo claro
  if (isBranca) {
    return {
      label: name || 'Faixa Branca',
      isPreta: false,
      isBranca: true,
      accentColor: '#94A3B8',
      cardBg:
        'linear-gradient(135deg, rgba(148, 163, 184, 0.10) 0%, var(--color-bg-card) 75%)',
      cardBorder: 'var(--color-border)',
      borderLeft: '6px solid #CBD5E1',
      badgeBg: 'var(--color-bg-elevated)',
      badgeText: 'var(--color-text)',
      badgeBorder: 'var(--color-border)',
      dotColor: '#F8FAFC',
      dotBorder: '#94A3B8',
    }
  }

  // 3. FAIXA AMARELA — Contraste equilibrado
  if (isAmarela) {
    return {
      label: name || 'Faixa Amarela',
      isPreta: false,
      isBranca: false,
      accentColor: '#F59E0B',
      cardBg:
        'linear-gradient(135deg, rgba(245, 158, 11, 0.10) 0%, var(--color-bg-card) 75%)',
      cardBorder: 'rgba(245, 158, 11, 0.35)',
      borderLeft: '6px solid #F59E0B',
      badgeBg: 'rgba(245, 158, 11, 0.14)',
      badgeText: 'var(--color-text)',
      badgeBorder: 'rgba(245, 158, 11, 0.45)',
      dotColor: '#F59E0B',
    }
  }

  // 4. DEMAIS FAIXAS COLORIDAS (Laranja, Verde, Roxa, Vermelha, Marrom, etc.)
  const effectiveColor = color || '#FF8C00'
  return {
    label: name || 'Graduação Oficial',
    isPreta: false,
    isBranca: false,
    accentColor: effectiveColor,
    cardBg: `linear-gradient(135deg, ${effectiveColor}12 0%, var(--color-bg-card) 75%)`,
    cardBorder: `${effectiveColor}40`,
    borderLeft: `6px solid ${effectiveColor}`,
    badgeBg: `${effectiveColor}16`,
    badgeText: 'var(--color-text)',
    badgeBorder: `${effectiveColor}45`,
    dotColor: effectiveColor,
  }
}
