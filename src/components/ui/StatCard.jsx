export function StatCard({ label, value, accent, sub, dark = false }) {
  return (
    <div className={
      dark
        ? 'bg-dark-surface border border-dark-border rounded-xl p-5'
        : 'bg-white border border-border rounded-xl p-5'
    }>
      <p className={`text-[12px] font-medium uppercase tracking-[0.07em] mb-2 ${dark ? 'text-dark-muted' : 'text-ink-3'}`}>
        {label}
      </p>
      <p className={`font-display font-bold text-[28px] leading-none ${accent ?? (dark ? 'text-white' : 'text-ink')}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-[12px] mt-1.5 ${dark ? 'text-dark-muted' : 'text-ink-3'}`}>
          {sub}
        </p>
      )}
    </div>
  )
}
