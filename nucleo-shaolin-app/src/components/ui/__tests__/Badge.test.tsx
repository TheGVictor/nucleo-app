import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge Component', () => {
  it('renders children content properly', () => {
    render(<Badge>Faixa Laranja</Badge>)
    expect(screen.getByText('Faixa Laranja')).toBeInTheDocument()
  })

  it('applies default badge-muted class when no variant is passed', () => {
    const { container } = render(<Badge>Texto</Badge>)
    expect(container.firstChild).toHaveClass('badge', 'badge-muted')
  })

  it('applies specific variant classes', () => {
    const variants = ['primary', 'gold', 'success', 'error', 'warning'] as const

    variants.forEach((v) => {
      const { container } = render(<Badge variant={v}>{v}</Badge>)
      expect(container.firstChild).toHaveClass(`badge-${v}`)
    })
  })
})
