'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { EventTile } from '@/features/shared-ui'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '@/shared/utils/format'
import { Plan } from '@/features/organiser/types/plan.types'

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'In Progress', style: 'bg-success/15 text-[#166534]' },
  completed:    { label: 'Completed',   style: 'bg-[#F3F4F6] text-[#374151]' },
  disputed:     { label: 'Disputed',    style: 'bg-red-100 text-red-600' },
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: string
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <p className="text-[12px] text-ink-3 font-medium mb-1">{label}</p>
      <p className={`font-display font-bold text-[28px] leading-none ${accent ?? 'text-ink'}`}>{value}</p>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-1">
          Welcome back
        </p>
        <h1 className="font-display font-bold text-[28px] text-ink leading-tight">
          {user?.name?.split(' ')[0] ?? 'Hey'}'s dashboard
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total plans"    value={plans.length}     sub={`${activePlans.length} active`} />
        <StatCard label="Total bids in"  value={totalBids}        accent="text-primary" />
        <StatCard label="Open for bids"  value={plans.filter(p => (p.status as string) === 'open').length} />
        <StatCard label="In progress"    value={plans.filter(p => (p.status as string) === 'in-progress').length} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Plan an Event', desc: 'Create a new event plan', href: '/organiser/create-plan', emoji: '✨' },
          { label: 'My Plans',      desc: 'View and manage your plans', href: '/organiser/plans',       emoji: '📋' },
          { label: 'Find Vendors',  desc: 'Browse vendor marketplace', href: '/organiser/marketplace',  emoji: '🛒' },
        ].map(({ label, desc, href, emoji }) => (
          <Link key={href} href={href}
            className="bg-white border border-border rounded-xl p-5 flex items-start gap-3 hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <p className="font-medium text-ink text-[14px] group-hover:text-primary transition-colors">{label}</p>
              <p className="text-ink-3 text-[12px] mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {plans.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <p className="text-[22px] mb-3">🎉</p>
          <p className="font-display font-bold text-[18px] text-ink mb-1">No plans yet</p>
          <p className="text-ink-3 text-[14px] mb-5">Create your first event plan to start receiving bids from vendors.</p>
          <Link href="/organiser/create-plan"
            className="inline-flex px-6 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Plan an Event
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">Recent plans</p>
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
