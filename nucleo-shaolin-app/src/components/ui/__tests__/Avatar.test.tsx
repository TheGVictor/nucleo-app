import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from '../Avatar'

describe('Avatar Component', () => {
  it('renders 2-letter initials for full names', () => {
    render(<Avatar name="Bruce Lee" />)
    expect(screen.getByText('BL')).toBeInTheDocument()
  })

  it('renders initials for longer multi-word names using first two words', () => {
    render(<Avatar name="Gabriel Victor Sancinetti" />)
    expect(screen.getByText('GV')).toBeInTheDocument()
  })

  it('renders single initial for single-word names', () => {
    render(<Avatar name="Sifu" />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('applies default size md', () => {
    const { container } = render(<Avatar name="Aluno Teste" />)
    expect(container.firstChild).toHaveClass('avatar', 'avatar-md')
  })

  it('applies custom size classes (sm, lg, xl)', () => {
    const { container: cSm } = render(<Avatar name="A" size="sm" />)
    expect(cSm.firstChild).toHaveClass('avatar-sm')

    const { container: cLg } = render(<Avatar name="A" size="lg" />)
    expect(cLg.firstChild).toHaveClass('avatar-lg')

    const { container: cXl } = render(<Avatar name="A" size="xl" />)
    expect(cXl.firstChild).toHaveClass('avatar-xl')
  })

  it('applies gold modifier class when gold is true', () => {
    const { container } = render(<Avatar name="Sifu Mestre" gold />)
    expect(container.firstChild).toHaveClass('avatar-gold')
  })
})
