'use client'

interface Modality {
  id: string
  name: string
  slug: string
}

interface ModalitySelectorProps {
  modalities: Modality[]
  active: string
  onChange: (slug: string) => void
}

export function ModalitySelector({ modalities, active, onChange }: ModalitySelectorProps) {
  return (
    <div
      className="no-scrollbar"
      style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
      }}
    >
      {modalities.map(m => (
        <button
          key={m.slug}
          onClick={() => onChange(m.slug)}
          className={`modality-chip ${active === m.slug ? 'active' : ''}`}
        >
          {m.name}
        </button>
      ))}
    </div>
  )
}