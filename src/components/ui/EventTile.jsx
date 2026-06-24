const SIZES = {
  sm:  'w-9  h-9  rounded-lg  text-lg',
  md:  'w-11 h-11 rounded-xl  text-xl',
  lg:  'w-14 h-14 rounded-xl  text-2xl',
  xl:  'w-16 h-16 rounded-2xl text-3xl',
}

export function EventTile({ emoji, bg, size = 'md', className = '' }) {
  return (
    <span
      className={`flex items-center justify-center shrink-0 ${SIZES[size]} ${className}`}
      style={{ background: bg }}
    >
      {emoji}
    </span>
  )
}
