'use client'

const ACCENT = {
  primary: { active: 'border-primary text-primary',       inactive: 'border-transparent text-ink-3 hover:text-ink',        border: 'border-border' },
  warning: { active: 'border-warning text-[#92660A]',     inactive: 'border-transparent text-ink-3 hover:text-ink',        border: 'border-border' },
  dark:    { active: 'border-primary text-primary',       inactive: 'border-transparent text-dark-muted hover:text-white', border: 'border-dark-border' },
}

export function Tabs({ tabs, active, onChange, accent = 'primary' }) {
  const a = ACCENT[accent] ?? ACCENT.primary
  return (
    <div className={`flex gap-1 border-b ${a.border}`}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors ${
            active === t.id ? a.active : a.inactive
          }`}
        >
          {t.label}
          {t.count != null && (
            <span className="ml-1.5 text-[11px] font-mono opacity-60">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
