import { Clock } from 'lucide-react'

interface ComingSoonProps {
  /** 'sm' for inline use beside buttons/labels; 'md' for standalone chips. */
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

// Small "Coming soon" pill for features that aren't in this sprint
// (e.g. escrow funding / payments). Drop it beside the relevant control.
export function ComingSoon({ size = 'sm', label = 'Coming soon', className = '' }: ComingSoonProps) {
  const dims = size === 'sm' ? 'gap-1 px-2 py-0.5 text-[10px]' : 'gap-1.5 px-3 py-1 text-[12px]'
  const icon = size === 'sm' ? 11 : 13
  return (
    <span
      className={`inline-flex items-center rounded-full border border-warning/30 bg-warning/15 font-semibold uppercase tracking-wide text-[#9A7A00] ${dims} ${className}`}
    >
      <Clock size={icon} />
      {label}
    </span>
  )
}

export default ComingSoon
