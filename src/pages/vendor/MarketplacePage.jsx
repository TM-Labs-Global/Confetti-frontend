'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EVENT_META, EVENT_TYPES } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '../../utils/format'

export default function MarketplacePage() {
  const [plans, setPlans]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const params = typeFilter !== 'all' ? `?eventType=${typeFilter}` : ''
    fetch(`/api/marketplace${params}`)
      .then(r => r.ok ? r.json() : { plans: [] })
      .then(data => setPlans(data.plans ?? []))
      .finally(() => setLoading(false))
  }, [typeFilter])

  const filtered = plans.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
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
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-1">Vendor</p>
        <h1 className="font-display font-bold text-[28px] text-ink">Open Plans</h1>
        <p className="text-ink-3 text-[14px] mt-1">Browse events looking for vendors and submit your bids.</p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-[360px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors bg-white"
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">All events</option>
          {EVENT_TYPES.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-[24px] mb-3">🔍</p>
          <p className="font-display font-bold text-[18px] text-ink mb-1">No open plans</p>
          <p className="text-ink-3 text-[14px]">Check back soon — new events are added regularly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(plan => {
            const meta      = EVENT_META[plan.eventTypeId] ?? { emoji: '🎉', bg: '#F5F5F5' }
            const dateLabel = plan.dateFlexible ? 'Flexible date' : (plan.date ? fmtDate(plan.date) : 'No date')
            return (
              <Link key={plan.id} href={`/vendor/marketplace/${plan.id}`}
                className="bg-white border border-border rounded-xl p-5 hover:border-warning/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: meta.bg }}>
                    {meta.emoji}
                  </span>
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
                  <p>💰 {fmtNaira(plan.totalBudget)} budget</p>
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
