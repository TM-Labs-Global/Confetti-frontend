const SIZES = {
  sm: 'text-[10px] px-2    py-0.5',
  md: 'text-[11px] px-2.5  py-1',
}

export function StatusBadge({ label, style, size = 'sm' }) {
  return (
    <span className={`font-medium rounded-full ${SIZES[size]} ${style}`}>
      {label}
    </span>
  )
}
