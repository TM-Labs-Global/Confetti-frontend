'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '../../utils/format'

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'In Progress', style: 'bg-success/15 text-[#166534]' },
  completed:    { label: 'Completed',   style: 'bg-[#F3F4F6] text-[#374151]' },
  disputed:     { label: 'Disputed',    style: 'bg-red-100 text-red-600' },
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
      <p className="text-[12px] font-medium uppercase tracking-[0.07em] text-dark-muted mb-2">{label}</p>
      <p className={`font-display font-bold text-[28px] leading-none ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [plans, setPlans]         = useState([])
  const [eventTypes, setEventTypes] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/plans').then(r => r.ok ? r.json() : { plans: [] }),
      fetch('/api/categories').then(r => r.ok ? r.json() : { eventTypes: [] }),
    ]).then(([plansData, catsData]) => {
      setPlans(plansData.plans ?? [])
      setEventTypes(catsData.eventTypes ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const openPlans    = plans.filter(p => p.status !== 'draft').length
  const totalBids    = plans.reduce((s, p) => s + (p.bidCount ?? 0), 0)
  const totalCats    = eventTypes.reduce((s, et) => s + (et.categories?.length ?? 0), 0)
  const recentPlans  = [...plans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-8">
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-1">Platform Overview</p>
        <h1 className="font-display font-bold text-[28px] text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Plans"  value={plans.length}       />
        <StatCard label="Live Plans"   value={openPlans}          accent="text-primary" />
        <StatCard label="Total Bids"   value={totalBids}          accent="text-warning" />
        <StatCard label="Event Types"  value={eventTypes.length}  />
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <p className="font-display font-semibold text-[14px] text-white">Recent Plans</p>
          <Link href="/admin/plans" className="text-[12px] text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-dark-border">
          {recentPlans.length === 0 ? (
            <p className="text-dark-muted text-[13px] text-center py-10">No plans yet</p>
          ) : recentPlans.map(plan => {
            const meta = EVENT_META[plan.eventTypeId] ?? { emoji: '🎉', bg: '#1e293b' }
            const st   = STATUS_META[plan.status] ?? STATUS_META.draft
            return (
              <Link key={plan.id} href={`/admin/plans/${plan.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors group"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: meta.bg }}>
                  {meta.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate group-hover:text-primary transition-colors">{plan.name}</p>
                  <p className="text-dark-muted text-[11px] mt-0.5">{plan.city}, {plan.state}</p>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <p className="text-[13px] font-semibold text-white tabular-nums">{fmtNaira(plan.totalBudget)}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
                  <p className="text-[12px] text-primary">{plan.bidCount ?? 0} bids</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/categories" className="bg-dark-surface border border-dark-border rounded-xl p-5 hover:border-primary/40 transition-colors group">
          <p className="font-display font-semibold text-[15px] text-white mb-1 group-hover:text-primary transition-colors">Manage Categories</p>
          <p className="text-dark-muted text-[13px]">{eventTypes.length} event types · {totalCats} categories</p>
        </Link>
        <Link href="/admin/plans" className="bg-dark-surface border border-dark-border rounded-xl p-5 hover:border-primary/40 transition-colors group">
          <p className="font-display font-semibold text-[15px] text-white mb-1 group-hover:text-primary transition-colors">All Plans</p>
          <p className="text-dark-muted text-[13px]">{plans.length} total · {openPlans} live</p>
        </Link>
      </div>
    </div>
  )
}
