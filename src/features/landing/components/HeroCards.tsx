import { BadgeCheck, ShieldCheck } from 'lucide-react'

// Floating glassmorphic "in-product" cards that frame the hero headline.
// Decorative - hidden on small screens and frozen under reduced-motion.
export function HeroCards() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {/* Incoming bid - top left */}
      <div
        className="animate-float absolute left-[6%] top-[30%] w-[248px] rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass-strong)] p-4 shadow-2xl backdrop-blur-xl"
        style={{ ['--tilt' as string]: '-5deg', animationDelay: '0.4s' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-[16px]">🍲</span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[var(--ld-text)]">Mama Cass Kitchen</p>
            <p className="truncate text-[11px] text-[var(--ld-text-muted)]">bid on Catering & Jollof</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[16px] font-semibold text-[var(--ld-text)] tabular-nums">₦1,350,000</span>
          <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning">New</span>
        </div>
      </div>

      {/* Escrow funded - bottom right */}
      <div
        className="animate-float absolute right-[7%] top-[42%] w-[230px] rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass-strong)] p-4 shadow-2xl backdrop-blur-xl"
        style={{ ['--tilt' as string]: '5deg', animationDelay: '1.6s' }}
      >
        <div className="flex items-center gap-2 text-success">
          <ShieldCheck size={17} />
          <span className="text-[13px] font-semibold">Escrow funded</span>
        </div>
        <p className="mt-2 text-[20px] font-semibold text-[var(--ld-text)] tabular-nums">₦5,000,000</p>
        <div className="mt-3 flex items-center gap-1.5">
          {[true, true, true, false].map((done, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${done ? 'bg-success' : 'bg-[var(--ld-border)]'}`} />
          ))}
        </div>
      </div>

      {/* Verified vendor pill - left lower */}
      <div
        className="animate-float absolute left-[11%] top-[64%] flex items-center gap-2 rounded-full border border-[var(--ld-border)] bg-[var(--ld-glass-strong)] px-3.5 py-2 shadow-xl backdrop-blur-xl"
        style={{ ['--tilt' as string]: '3deg', animationDelay: '1s' }}
      >
        <BadgeCheck size={16} className="text-primary" />
        <span className="text-[12px] font-medium text-[var(--ld-text)]">Verified vendor</span>
      </div>
    </div>
  )
}

export default HeroCards
