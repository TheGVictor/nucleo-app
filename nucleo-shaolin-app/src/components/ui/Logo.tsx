import Image from 'next/image'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  priority?: boolean
}

const SIZES = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 72,
  xl: 96,
  '2xl': 128,
}

export function Logo({ size = 'md', className = '', priority = false }: LogoProps) {
  const px = SIZES[size]
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full border border-[var(--color-border-gold)] shadow-gold bg-[#0A1128] overflow-hidden ${className}`}
      style={{ width: px, height: px }}
    >
      <Image
        src="/logo.png"
        alt="Núcleo de Kung Fu Shaolin"
        width={px}
        height={px}
        className="w-full h-full object-contain"
        priority={priority}
      />
    </div>
  )
}
