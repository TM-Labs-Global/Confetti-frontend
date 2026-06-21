export function BudgetBar({ label, amount, pct, color, badge, dark = false }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] mb-1">
        <div className="flex items-center gap-2">
          <span className={dark ? 'text-white' : 'text-ink-2'}>{label}</span>
          {badge && <span className="text-[10px] text-primary font-mono">{badge}</span>}
        </div>
        <span className={`font-semibold tabular-nums ${dark ? 'text-white' : 'text-ink'}`}>
          {amount}
        </span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-dark' : 'bg-canvas border border-border'}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}
