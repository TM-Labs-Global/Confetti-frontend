'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ClipboardList, Store, PartyPopper } from 'lucide-react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { EventTile } from '@/features/shared-ui'
import { EVENT_META } from '../../data/mockCategories'
import { Plan } from '@/features/organiser/types/plan.types'

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'Vendors booked', style: 'bg-success/15 text-[#166534]' },
  completed:    { label: 'Completed',   style: 'bg-[#F3F4F6] text-[#374151]' },
  disputed:     { label: 'Disputed',    style: 'bg-red-100 text-red-600' },
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: string
}

// Animate a number from 0 to its target with an ease-out curve on mount.
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value); return
    }
    let raf = 0
    const start = performance.now()
    const duration = 650
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{n}</>
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/30">
      <p className="text-[12px] text-ink-3 font-medium mb-1">{label}</p>
      <p className={`font-display font-bold text-[28px] leading-none ${accent ?? 'text-ink'}`}>
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
      {sub && <p className="text-[12px] text-ink-3 mt-1.5">{sub}</p>}
    </div>
  )
}

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [plans, setPlans]   = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.ok ? r.json() : { plans: [] })
      .then(data => setPlans(data.plans ?? []))
      .finally(() => setLoading(false))
  }, [])

  const totalBids  = plans.reduce((s, p) => s + (p.bidCount ?? 0), 0)
  const activePlans = plans.filter(p => ['open', 'bidding', 'in-progress'].includes(p.status as string))
  const recentPlans = [...plans].slice(0, 3)

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayLabel = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })
  const subline =
    plans.length === 0
      ? "Let's plan something worth celebrating."
      : totalBids > 0
        ? `You've got ${totalBids} bid${totalBids !== 1 ? 's' : ''} waiting. Vendors love your events.`
        : activePlans.length > 0
          ? `${activePlans.length} event${activePlans.length !== 1 ? 's' : ''} in motion. Let's make ${activePlans.length !== 1 ? 'them' : 'it'} unforgettable.`
          : 'Your celebrations are taking shape.'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7 animate-rise" style={{ animationDelay: '0ms' }}>
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-1">{todayLabel}</p>
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-ink leading-tight">
          {timeGreeting}, {firstName} <span className="animate-wave inline-block">👋</span>
        </h1>
        <p className="text-ink-2 text-[14px] mt-1.5">{subline}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-rise" style={{ animationDelay: '80ms' }}>
        <StatCard label="Total events"   value={plans.length}     sub={`${activePlans.length} active`} />
        <StatCard label="Total bids in"  value={totalBids}        accent="text-primary" />
        <StatCard label="Open for bids"  value={plans.filter(p => (p.status as string) === 'open').length} />
        <StatCard label="In progress"    value={plans.filter(p => (p.status as string) === 'in-progress').length} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-rise" style={{ animationDelay: '160ms' }}>
        {[
          { label: 'Create an Event', desc: 'Start a new event', href: '/organiser/create-plan', Icon: Sparkles,      tint: 'bg-gradient-to-br from-primary/30 to-primary/5 text-primary ring-1 ring-inset ring-primary/20' },
          { label: 'My Events',     desc: 'View and manage your events', href: '/organiser/plans',     Icon: ClipboardList, tint: 'bg-gradient-to-br from-warning/35 to-warning/5 text-[#92660A] ring-1 ring-inset ring-warning/25' },
          { label: 'Find Vendors',  desc: 'Browse vendor marketplace', href: '/organiser/marketplace',  Icon: Store,        tint: 'bg-gradient-to-br from-success/30 to-success/5 text-[#166534] ring-1 ring-inset ring-success/20' },
        ].map(({ label, desc, href, Icon, tint }) => (
          <Link key={href} href={href}
            className="bg-white border border-border rounded-xl p-5 flex items-start gap-3 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-md ${tint}`}>
              <Icon size={19} />
            </span>
            <div>
              <p className="font-medium text-ink text-[14px] group-hover:text-primary transition-colors">{label}</p>
              <p className="text-ink-3 text-[12px] mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {plans.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center animate-rise" style={{ animationDelay: '240ms' }}>
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PartyPopper size={26} />
          </span>
          <p className="font-display font-bold text-[18px] text-ink mb-1">No events yet</p>
          <p className="text-ink-3 text-[14px] mb-5">Create your first event to start receiving bids from vendors.</p>
          <Link href="/organiser/create-plan"
            className="inline-flex px-6 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create an Event
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden animate-rise" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">Recent events</p>
            <Link href="/organiser/plans" className="text-[12px] text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentPlans.map(plan => {
              const meta = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
                ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
              const st   = STATUS_META[plan.status as keyof typeof STATUS_META] ?? STATUS_META.draft
              return (
                <Link key={plan.id} href={`/organiser/plans/${plan.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                >
                  <EventTile type={plan.eventTypeId || ''} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-[14px] truncate">{plan.name}</p>
                    <p className="text-ink-3 text-[12px] mt-0.5">{plan.city}, {plan.state}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
                    <p className="text-ink-3 text-[11px] mt-1">{plan.bidCount ?? 0} bid{plan.bidCount !== 1 ? 's' : ''}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3 shrink-0">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
