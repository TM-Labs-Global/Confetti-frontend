import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  dark?: boolean
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, dark = false, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        {eyebrow && (
          <p className={`text-[12px] font-mono uppercase tracking-[0.08em] mb-1 ${dark ? 'text-dark-muted' : 'text-ink-3'}`}>
            {eyebrow}
          </p>
        )}
        <h1 className={`font-display font-bold text-[28px] leading-tight ${dark ? 'text-white' : 'text-ink'}`}>
          {title}
        </h1>
        {description && (
          <p className={`text-[14px] mt-1 ${dark ? 'text-dark-muted' : 'text-ink-3'}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 ml-6">{action}</div>}
    </div>
  )
}
