import { createElement } from 'react'
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
  babyshower: Icons.Baby,
  graduation: Icons.GraduationCap,
  anniversary: Icons.Wine,
  'gender-reveal': Icons.PartyPopper,
  genderreveal: Icons.PartyPopper,
  housewarming: Icons.Home,
  'house-warming': Icons.Home,
  engagement: Icons.Gem,
  naming: Icons.Sparkles,
  burial: Icons.Flower2,
  funeral: Icons.Flower2,
  conference: Icons.Presentation,
  concert: Icons.Music,
  festival: Icons.Tent,
  launch: Icons.Rocket,
  reunion: Icons.Users,
  dinner: Icons.UtensilsCrossed,
  picnic: Icons.Trees,
}

// Deterministic varied fallback so unmapped/custom event types don't all share one icon
const FALLBACK_ICONS: React.ComponentType<any>[] = [
  Icons.PartyPopper,
  Icons.Sparkles,
  Icons.Gift,
  Icons.Star,
  Icons.Cake,
  Icons.Music,
  Icons.Tent,
  Icons.Crown,
  Icons.Flower2,
  Icons.Wine,
]

function fallbackIcon(type: string): React.ComponentType<any> {
  let hash = 0
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) >>> 0
  return FALLBACK_ICONS[hash % FALLBACK_ICONS.length]
}

interface EventTileProps {
  type: string
  bg: string
  color?: string
  size?: keyof typeof SIZES
  className?: string
}

export function EventTile({ type, bg, color, size = 'md', className = '' }: EventTileProps) {
  const icon = ICON_MAP[type] || fallbackIcon(type || 'event')
  const iconSize = ICON_SIZES[size]

  return (
    <span
      className={`flex items-center justify-center shrink-0 ${SIZES[size]} ${className}`}
      style={{ background: bg, color: color || 'inherit' }}
    >
      {createElement(icon, { size: iconSize })}
    </span>
  )
}
