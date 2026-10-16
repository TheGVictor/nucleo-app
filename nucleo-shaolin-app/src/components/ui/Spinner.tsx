export function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: '1rem', md: '1.5rem', lg: '2rem' }
  return (
    <span
      className="spinner"
      style={{ width: sizes[size], height: sizes[size] }}
      aria-label="Carregando"
    />
  )
}