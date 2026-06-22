import * as Icons from 'lucide-react'

const SIZES = {
  sm: 'w-9  h-9  rounded-lg',
  md: 'w-11 h-11 rounded-xl',
  lg: 'w-14 h-14 rounded-xl',
  xl: 'w-16 h-16 rounded-2xl',
} as const

const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const

// Map event type IDs to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  wedding: Icons.Heart,
  birthday: Icons.Cake,
  corporate: Icons.Briefcase,
  'baby-shower': Icons.Baby,
  graduation: Icons.GraduationCap,
  anniversary: Icons.Wine,
}

interface EventTileProps {
  type: string
  bg: string
  color?: string
  size?: keyof typeof SIZES
  className?: string
}

export function EventTile({ type, bg, color, size = 'md', className = '' }: EventTileProps) {
  const IconComponent = ICON_MAP[type] || Icons.PartyPopper
  const iconSize = ICON_SIZES[size]

  return (
    <span
      className={`flex items-center justify-center shrink-0 ${SIZES[size]} ${className}`}
      style={{ background: bg, color: color || 'inherit' }}
    >
      <IconComponent size={iconSize} />
    </span>
  )
}
