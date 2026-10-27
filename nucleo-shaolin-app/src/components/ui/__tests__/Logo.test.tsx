import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from '../Logo'

describe('Logo Component', () => {
  it('renders with image alt text for Núcleo de Kung Fu Shaolin', () => {
    render(<Logo />)
    const img = screen.getByAltText('Núcleo de Kung Fu Shaolin')
    expect(img).toBeInTheDocument()
  })

  it('renders default size md (48px)', () => {
    const { container } = render(<Logo />)
    expect(container.firstChild).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('applies sizes xs (24px) and 2xl (128px)', () => {
    const { container: cXs } = render(<Logo size="xs" />)
    expect(cXs.firstChild).toHaveStyle({ width: '24px', height: '24px' })

    const { container: c2Xl } = render(<Logo size="2xl" />)
    expect(c2Xl.firstChild).toHaveStyle({ width: '128px', height: '128px' })
  })

  it('appends custom className when passed', () => {
    const { container } = render(<Logo className="my-custom-logo-class" />)
    expect(container.firstChild).toHaveClass('my-custom-logo-class')
  })
})
