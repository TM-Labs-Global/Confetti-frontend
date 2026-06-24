import Link from 'next/link'

const ACTION_STYLES = {
  primary: 'bg-primary text-dark hover:bg-primary/90',
  warning: 'bg-warning text-dark hover:bg-warning/90',
  outline: 'border border-border text-ink-2 hover:bg-canvas',
} as const

interface EmptyStateAction {
  href: string
  label: string
  variant?: keyof typeof ACTION_STYLES
}

interface EmptyStateProps {
  heading: string
  description?: string
  action?: EmptyStateAction
  dark?: boolean
}

export function EmptyState({ heading, description, action, dark = false }: EmptyStateProps) {
  return (
    <div className={
      dark
        ? 'bg-dark-surface border border-dark-border rounded-xl p-12 text-center'
        : 'bg-white border border-border rounded-xl p-12 text-center'
    }>
      <p className={`font-display font-semibold text-[15px] mb-1 ${dark ? 'text-white' : 'text-ink'}`}>
        {heading}
      </p>
      {description && (
        <p className={`text-[13px] mb-5 ${dark ? 'text-dark-muted' : 'text-ink-3'}`}>
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors ${ACTION_STYLES[action.variant ?? 'primary']}`}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
