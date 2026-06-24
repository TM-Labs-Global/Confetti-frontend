'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ClipboardList, Trophy } from 'lucide-react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira } from '@/shared/utils/format'
import { EventTile } from '@/features/shared-ui'
import { VendorBid } from '@/features/vendor/types/vendor.types'
import { Plan } from '@/features/organiser/types/plan.types'

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166534]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
}

// Count a number up from 0 with an ease-out curve on mount.
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 650)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{n}</>
}

interface StatCardProps { label: string; value: number | string; accent?: string }
function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-warning/30">
      <p className="text-[12px] text-ink-3 font-medium mb-1">{label}</p>
      <p className={`font-display font-bold text-[28px] leading-none ${accent ?? 'text-ink'}`}>
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
    </div>
  )
}

export default function VendorDashboard() {
  const { user } = useAuth()
  const [bids, setBids]         = useState<VendorBid[]>([])
  const [plans, setPlans]       = useState<Plan[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/bids').then(r => r.ok ? r.json() : { bids: [] }),
      fetch('/api/marketplace').then(r => r.ok ? r.json() : { plans: [] }),
    ]).then(([bidsData, plansData]) => {
      setBids(bidsData.bids ?? [])
      setPlans(plansData.plans ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const activeBids   = bids.filter(b => b.status === 'pending').length
  const acceptedBids = bids.filter(b => b.status === 'accepted').length
  const recentBids   = [...bids].slice(0, 3)
  const vendorStatus = user?.vendorProfile?.status ?? null

  const planList = plans.slice(0, 3)
  const planHeading = 'Latest open events'

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayLabel = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })
  const subline =
    vendorStatus !== 'verified'
      ? 'Have a look around and line up the events you want to bid on.'
      : acceptedBids > 0
        ? `${acceptedBids} job${acceptedBids !== 1 ? 's' : ''} in the bag. Let's find the next one.`
        : activeBids > 0
          ? `${activeBids} bid${activeBids !== 1 ? 's' : ''} out there. Fingers crossed!`
          : 'Fresh events are waiting. Go land your first one.'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {vendorStatus !== 'verified' && (
        <Link href="/vendor/profile"
          className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-5 py-3.5 transition-colors no-underline ${
            vendorStatus === 'suspended'
              ? 'border-red-300 bg-red-50 hover:bg-red-100'
              : 'border-warning/40 bg-warning/10 hover:bg-warning/15'
          }`}
        >
          <div>
            <p className={`font-medium text-[14px] ${vendorStatus === 'suspended' ? 'text-red-700' : 'text-ink'}`}>
              {vendorStatus === 'suspended' ? 'Your account is suspended'
                : vendorStatus === 'pending' ? 'Your profile is under review'
                : vendorStatus === 'rejected' ? 'Your profile needs changes'
                : 'Complete your profile to start bidding'}
            </p>
            <p className={`text-[12px] mt-0.5 ${vendorStatus === 'suspended' ? 'text-red-600' : 'text-ink-3'}`}>
              {vendorStatus === 'suspended'
                ? "You can't bid until an admin reinstates your account. See your profile for the reason."
                : vendorStatus === 'pending'
                  ? "An admin is reviewing it. You'll be able to bid once verified."
                  : 'Organisers need to see who you are and what you do before they accept a bid.'}
            </p>
          </div>
          {(vendorStatus === 'rejected' || vendorStatus === null) && (
            <span className="shrink-0 rounded-lg bg-warning px-4 py-2 text-[13px] font-semibold text-dark">
              {vendorStatus === 'rejected' ? 'Fix profile' : 'Set up profile'}
            </span>
          )}
        </Link>
      )}

      <div className="mb-7 animate-rise" style={{ animationDelay: '0ms' }}>
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-1">{todayLabel}</p>
        <h1 className="font-display font-bold text-[28px] text-ink leading-tight">
          {timeGreeting}, {firstName} <span className="animate-wave inline-block">👋</span>
        </h1>
        <p className="text-ink-2 text-[14px] mt-1.5">{subline}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 animate-rise" style={{ animationDelay: '80ms' }}>
        <StatCard label="Total bids"  value={bids.length} />
        <StatCard label="Active bids" value={activeBids}   accent="text-warning" />
        <StatCard label="Accepted"    value={acceptedBids} accent="text-success" />
        <StatCard label="Open events" value={plans.length} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 animate-rise" style={{ animationDelay: '160ms' }}>
        {[
          { label: 'Browse Events', desc: 'Find events to bid on', href: '/vendor/marketplace', Icon: Search,        tint: 'bg-gradient-to-br from-primary/30 to-primary/5 text-primary ring-1 ring-inset ring-primary/20' },
          { label: 'My Bids',      desc: 'Track your submissions',  href: '/vendor/bids',        Icon: ClipboardList, tint: 'bg-gradient-to-br from-warning/35 to-warning/5 text-[#92660A] ring-1 ring-inset ring-warning/25' },
          { label: 'Win Rate',     desc: `${acceptedBids} of ${bids.length} bids accepted`, href: '/vendor/bids', Icon: Trophy, tint: 'bg-gradient-to-br from-success/30 to-success/5 text-[#166534] ring-1 ring-inset ring-success/20' },
        ].map(({ label, desc, href, Icon, tint }) => (
          <Link key={href + label} href={href}
            className="bg-white border border-border rounded-xl p-5 flex items-start gap-3 hover:border-warning/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-md ${tint}`}>
              <Icon size={19} />
            </span>
            <div>
              <p className="font-medium text-ink text-[14px] group-hover:text-warning transition-colors">{label}</p>
              <p className="text-ink-3 text-[12px] mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {bids.length > 0 && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">Recent bids</p>
            <Link href="/vendor/bids" className="text-[12px] text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentBids.map(bid => {
              const bs   = BID_STATUS_META[bid.status] ?? BID_STATUS_META.pending
              const meta = (bid.plan?.eventTypeId && bid.plan.eventTypeId in EVENT_META)
                ? EVENT_META[bid.plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
              return (
                <Link key={bid.id} href={`/vendor/marketplace/${bid.planId}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                >
                  <EventTile type={bid.plan?.eventTypeId || ''} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-[14px] truncate">{bid.plan?.name}</p>
                    <p className="text-ink-3 text-[12px] mt-0.5">{bid.planCategory?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-ink text-[14px] tabular-nums">{fmtNaira(bid.amount)}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${bs.style}`}>{bs.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {planList.length > 0 && (
        <div className="bg-white border border-border rounded-xl overflow-hidden mt-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">{planHeading}</p>
            <Link href="/vendor/marketplace" className="text-[12px] text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {planList.map(plan => {
              const meta = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
                ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
              return (
                <Link key={plan.id} href={`/vendor/marketplace/${plan.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                >
                  <EventTile type={plan.eventTypeId} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-[14px] truncate">{plan.name}</p>
                    <p className="text-ink-3 text-[12px] mt-0.5">{plan.city}, {plan.state}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-ink text-[13px] tabular-nums">{fmtNaira(plan.totalBudget)}</p>
                    <p className="text-ink-3 text-[11px] mt-0.5">{plan.bidCount ?? 0} bids</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
