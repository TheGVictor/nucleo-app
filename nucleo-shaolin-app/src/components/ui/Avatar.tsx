interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  gold?: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export function Avatar({ name, size = 'md', gold = false }: AvatarProps) {
  return (
    <div className={`avatar avatar-${size} ${gold ? 'avatar-gold' : ''}`}>
      {getInitials(name)}
    </div>
  )
}