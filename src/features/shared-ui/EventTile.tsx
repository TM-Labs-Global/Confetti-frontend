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

// Vibrant colour + light tint pairs for event types that aren't in EVENT_META
// (e.g. admin-added types), so their tiles are never a flat grey.
const FALLBACK_VISUALS: Array<{ color: string; bg: string }> = [
  { color: '#E07A8F', bg: '#FDF0F3' },
  { color: '#F5923E', bg: '#FEF5EE' },
  { color: '#6C7CC7', bg: '#F0F2FB' },
  { color: '#A370DB', bg: '#F5EEFB' },
  { color: '#2AB56E', bg: '#EDFBF2' },
  { color: '#D4A017', bg: '#FEF9EA' },
  { color: '#00B5C4', bg: '#E8FAFC' },
  { color: '#EF6F9B', bg: '#FDEFF5' },
]

function hashType(type: string): number {
  let hash = 0
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) >>> 0
  return hash
}

function fallbackIcon(type: string): React.ComponentType<any> {
  return FALLBACK_ICONS[hashType(type) % FALLBACK_ICONS.length]
}

function fallbackVisual(type: string): { color: string; bg: string } {
  return FALLBACK_VISUALS[hashType(type) % FALLBACK_VISUALS.length]
}

// Placeholder colours the pages pass for an unknown event type: grey on light
// surfaces, brand cyan on the dark admin surface. Either should be swapped for a
// deterministic varied colour so no tile is flat/uniform.
const FALLBACK_SENTINELS = new Set(['#A3A3A3', '#A3A3A3FF', '#00C4CC'])

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

  // When a page passes the grey placeholder (unknown event type on a light
  // surface), swap in a deterministic colourful tile so it isn't washed out.
  const useFallback = !color || FALLBACK_SENTINELS.has(color)
  const fv = useFallback ? fallbackVisual(type || 'event') : null
  const finalColor = fv ? fv.color : color
  const finalBg = fv ? fv.bg : bg

  return (
    <span
      className={`flex items-center justify-center shrink-0 ${SIZES[size]} ${className}`}
      style={{ background: finalBg, color: finalColor || 'inherit' }}
    >
      {createElement(icon, { size: iconSize })}
    </span>
  )
}
