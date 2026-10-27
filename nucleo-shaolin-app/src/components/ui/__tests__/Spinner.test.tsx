import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from '../Spinner'

describe('Spinner Component', () => {
  it('renders with accessibility aria-label="Carregando"', () => {
    render(<Spinner />)
    const spinner = screen.getByLabelText('Carregando')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('spinner')
  })

  it('renders default size sm (1rem / 16px)', () => {
    render(<Spinner />)
    const spinner = screen.getByLabelText('Carregando')
    expect(spinner).toHaveStyle({ width: '16px', height: '16px' })
  })

  it('renders size md (1.5rem / 24px)', () => {
    render(<Spinner size="md" />)
    const spinner = screen.getByLabelText('Carregando')
    expect(spinner).toHaveStyle({ width: '24px', height: '24px' })
  })

  it('renders size lg (2rem / 32px)', () => {
    render(<Spinner size="lg" />)
    const spinner = screen.getByLabelText('Carregando')
    expect(spinner).toHaveStyle({ width: '32px', height: '32px' })
  })
})
