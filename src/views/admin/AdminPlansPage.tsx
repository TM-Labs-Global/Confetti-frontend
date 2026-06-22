'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '@/shared/utils/format'
import { EventTile } from '@/features/shared-ui'
import { Plan } from '@/features/organiser/types/plan.types'

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'In Progress', style: 'bg-success/15 text-[#166534]' },
  completed:    { label: 'Completed',   style: 'bg-[#F3F4F6] text-[#374151]' },
  disputed:     { label: 'Disputed',    style: 'bg-red-100 text-red-600' },
}

const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'open',      label: 'Open' },
  { id: 'bidding',   label: 'Bidding' },
  { id: 'draft',     label: 'Draft' },
  { id: 'completed', label: 'Completed' },
]

export default function AdminPlansPage() {
  const [plans, setPlans]     = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all')
  const [query, setQuery]     = useState('')

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.ok ? r.json() : { plans: [] })
      .then(data => setPlans(data.plans ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = plans.filter(p => {
    const matchTab   = tab === 'all' || (p.status as string) === tab
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase())
    return matchTab && matchQuery
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-7">
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-1">Platform</p>
        <h1 className="font-display font-bold text-[28px] text-white">All Plans</h1>
      </div>

      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search plans…"
          className="w-full pl-10 pr-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="flex gap-1 border-b border-dark-border mb-5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors ${
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-dark-muted hover:text-white'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-[11px] font-mono opacity-60">
              {t.id === 'all' ? plans.length : plans.filter(p => (p.status as string) === t.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display font-semibold text-white text-[15px] mb-1">No plans found</p>
            <p className="text-dark-muted text-[13px]">Try a different tab or search term.</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {filtered.map(plan => {
              const meta = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
                ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
              const st   = STATUS_META[plan.status as keyof typeof STATUS_META] ?? STATUS_META.draft
              return (
                <Link key={plan.id} href={`/admin/plans/${plan.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors group"
                >
                  <EventTile type={plan.eventTypeId || ''} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate group-hover:text-primary transition-colors">{plan.name}</p>
                    <p className="text-dark-muted text-[11px] mt-0.5">{plan.city}, {plan.state}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] text-dark-muted mb-0.5">Budget</p>
                      <p className="text-[13px] font-semibold text-white tabular-nums">{fmtNaira(plan.totalBudget)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-dark-muted mb-0.5">Bids</p>
                      <p className="text-[13px] font-semibold text-primary tabular-nums">{plan.bidCount ?? 0}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${st.style}`}>{st.label}</span>
                    <svg className="text-dark-muted group-hover:text-primary transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
