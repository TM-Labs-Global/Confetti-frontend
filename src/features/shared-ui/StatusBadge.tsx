const SIZES = {
  sm: 'text-[10px] px-2    py-0.5',
  md: 'text-[11px] px-2.5  py-1',
} as const

interface StatusBadgeProps {
  label: string
  style: string
  size?: keyof typeof SIZES
}

export function StatusBadge({ label, style, size = 'sm' }: StatusBadgeProps) {
  return (
    <span className={`font-medium rounded-full ${SIZES[size]} ${style}`}>
      {label}
    </span>
  )
}
