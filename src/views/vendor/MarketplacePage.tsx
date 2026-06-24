'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { EVENT_META, EVENT_TYPES } from '../../data/mockCategories'
import { fmtNaira, fmtDateRange } from '@/shared/utils/format'
import { EventTile, DateRangeFilter, type DateFilter } from '@/features/shared-ui'
import { Plan } from '@/features/organiser/types/plan.types'

// "YYYY-MM" key + a human label for a plan's start date.
function monthKey(dateStr: string | null | undefined): string {
  if (!dateStr) return 'flexible'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
// Local "YYYY-MM-DD" for a plan's start date (null when flexible/unset).
function dayKey(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function monthLabel(key: string): string {
  if (key === 'flexible') return 'Flexible date'
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
}

export default function MarketplacePage() {
  const [plans, setPlans]       = useState<Plan[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>({ kind: 'all' })

  useEffect(() => {
    const params = typeFilter !== 'all' ? `?eventType=${typeFilter}` : ''
    fetch(`/api/marketplace${params}`)
      .then(r => r.ok ? r.json() : { plans: [] })
      .then(data => setPlans(data.plans ?? []))
      .finally(() => setLoading(false))
  }, [typeFilter])

  // Filter options derived from the plans actually available.
  const states = useMemo(
    () => [...new Set(plans.map(p => p.state).filter(Boolean))].sort(),
    [plans],
  )
  const months = useMemo(() => {
    const keys = [...new Set(plans.map(p => monthKey(p.dateFlexible ? null : p.startDate)))]
    return keys.sort((a, b) => (a === 'flexible' ? 1 : b === 'flexible' ? -1 : a.localeCompare(b)))
  }, [plans])

  const filtered = plans.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (stateFilter !== 'all' && p.state !== stateFilter) return false

    const planMonth = monthKey(p.dateFlexible ? null : p.startDate)
    const planDay = p.dateFlexible ? null : dayKey(p.startDate)
    if (dateFilter.kind === 'flexible' && planDay !== null) return false
    if (dateFilter.kind === 'month' && planMonth !== dateFilter.key) return false
    if (dateFilter.kind === 'range') {
      if (!planDay || planDay < dateFilter.from || planDay > dateFilter.to) return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-ink">Open Events</h1>
        <p className="text-ink-3 text-[14px] mt-1">Browse events looking for vendors and submit your bids.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors bg-white"
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="w-[140px] shrink-0 px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">All events</option>
          {EVENT_TYPES.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
          className="w-[150px] shrink-0 px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">All locations</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <DateRangeFilter value={dateFilter} onChange={setDateFilter} months={months} monthLabel={monthLabel} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-[24px] mb-3">🔍</p>
          <p className="font-display font-bold text-[18px] text-ink mb-1">
            {plans.length === 0 ? 'No open plans' : 'No plans match your filters'}
          </p>
          <p className="text-ink-3 text-[14px]">
            {plans.length === 0 ? 'Check back soon. New events are added regularly.' : 'Try a different event type, location, or date.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(plan => {
            const meta      = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
              ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
              : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
            const dateLabel = fmtDateRange(plan.startDate, plan.endDate, plan.dateFlexible)
            return (
              <Link key={plan.id} href={`/vendor/marketplace/${plan.id}`}
                className="bg-white border border-border rounded-xl p-5 hover:border-warning/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <EventTile type={plan.eventTypeId} bg={meta.bg} color={meta.color} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink-3">{plan.eventType?.name}</p>
                    <p className="font-display font-semibold text-[16px] text-ink leading-tight mt-0.5 group-hover:text-primary transition-colors truncate">
                      {plan.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-[13px] text-ink-3 mb-4">
                  <p>📍 {plan.city}, {plan.state}</p>
                  <p>📅 {dateLabel}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-[12px] text-ink-3">{(plan.categories ?? []).length} services needed</p>
                  <span className="text-[12px] text-primary font-medium">{plan.bidCount ?? 0} bid{plan.bidCount !== 1 ? 's' : ''} →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
