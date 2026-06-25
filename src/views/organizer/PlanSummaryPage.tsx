'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { EventTile, ConfettiBurst, DateRangeFilter, type DateFilter } from '@/features/shared-ui'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDateRange } from '@/shared/utils/format'
import { Plan } from '@/features/organiser/types/plan.types'

function monthKey(dateStr: string | null | undefined): string {
  if (!dateStr) return 'flexible'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
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

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'Vendors booked', style: 'bg-success/15 text-[#166534]' },
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

export default function PlanSummaryPage() {
  const searchParams            = useSearchParams()
  const justPublished           = searchParams.get('published') === 'true'
  const [plans, setPlans]       = useState<Plan[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('all')
  const [search, setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>({ kind: 'all' })
  const [showBanner, setShowBanner] = useState(justPublished)
  // Resolved client-side only, so the "past event" check never trips hydration.
  const [nowTs, setNowTs] = useState<number | null>(null)
  useEffect(() => {
    setNowTs(Date.now())
    // Tick so "past event / close-out" nudges appear live without a reload.
    const t = setInterval(() => setNowTs(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.ok ? r.json() : { plans: [] })
      .then(data => setPlans(data.plans ?? []))
      .finally(() => setLoading(false))
  }, [])

  // A dated event whose end has passed, isn't a draft/disputed, and hasn't been
  // closed out yet - the organiser should mark how it went.
  function needsCloseout(p: Plan): boolean {
    if (nowTs == null || p.dateFlexible) return false
    if (['completed', 'draft', 'disputed'].includes(p.status as string)) return false
    const endTs = (p.endDate ?? p.startDate) ? new Date((p.endDate ?? p.startDate) as string).getTime() : null
    return endTs != null && nowTs > endTs
  }
  const closeoutCount = plans.filter(needsCloseout).length

  const months = useMemo(() => {
    const keys = [...new Set(plans.map(p => monthKey(p.dateFlexible ? null : p.startDate)))]
    return keys.sort((a, b) => (a === 'flexible' ? 1 : b === 'flexible' ? -1 : a.localeCompare(b)))
  }, [plans])

  const filtered = plans.filter(p => {
    if (tab !== 'all' && (p.status as string) !== tab) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false

    const planDay = p.dateFlexible ? null : dayKey(p.startDate)
    if (dateFilter.kind === 'flexible' && planDay !== null) return false
    if (dateFilter.kind === 'month' && monthKey(p.dateFlexible ? null : p.startDate) !== dateFilter.key) return false
    if (dateFilter.kind === 'range') {
      if (!planDay || planDay < dateFilter.from || planDay > dateFilter.to) return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {showBanner && <ConfettiBurst variant="center" />}
      {showBanner && (
        <div className="bg-success/10 border border-success/30 rounded-xl px-5 py-3.5 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-medium text-ink text-[14px]">Your event is live!</p>
              <p className="text-ink-3 text-[12px]">Vendors can now browse and submit bids.</p>
            </div>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-ink-3 hover:text-ink text-[18px] leading-none">×</button>
        </div>
      )}

      {closeoutCount > 0 && (
        <div className="bg-warning/10 border border-warning/40 rounded-xl px-5 py-3.5 flex items-center gap-3 mb-5">
          <span className="text-xl">🗓️</span>
          <p className="text-[13px] text-ink-2">
            <span className="font-medium text-ink">{closeoutCount} event{closeoutCount !== 1 ? 's have' : ' has'} wrapped up.</span>{' '}
            Open {closeoutCount !== 1 ? 'them' : 'it'} to let us know how {closeoutCount !== 1 ? 'they' : 'it'} went and close {closeoutCount !== 1 ? 'them' : 'it'} out.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-1">Organiser</p>
          <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-ink">My Events</h1>
        </div>
        <Link href="/organiser/create-plan"
          className="px-5 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          + New Event
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-[360px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors bg-white"
          />
        </div>
        <DateRangeFilter value={dateFilter} onChange={setDateFilter} months={months} monthLabel={monthLabel} />
      </div>

      <div className="flex flex-wrap gap-1 mb-5">
        {TABS.map(t => {
          const count = t.id === 'all' ? plans.length : plans.filter(p => (p.status as string) === t.id).length
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                tab === t.id
                  ? 'bg-primary text-dark'
                  : 'text-ink-3 hover:text-ink hover:bg-canvas'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[11px] ${tab === t.id ? 'text-dark/60' : 'text-ink-3'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-[24px] mb-3">📭</p>
          <p className="font-display font-bold text-[18px] text-ink mb-1">No events found</p>
          <p className="text-ink-3 text-[14px] mb-5">
            {plans.length === 0 ? 'Create your first event to get started.' : 'Try a different filter or search term.'}
          </p>
          {plans.length === 0 && (
            <Link href="/organiser/create-plan"
              className="inline-flex px-6 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create an Event
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map(plan => {
              const meta     = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
                ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
              const st       = STATUS_META[plan.status as keyof typeof STATUS_META] ?? STATUS_META.draft
              const dateLabel = fmtDateRange(plan.startDate, plan.endDate, plan.dateFlexible)
              return (
                <Link key={plan.id} href={`/organiser/plans/${plan.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                >
                  <EventTile type={plan.eventTypeId || ''} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-[14px] truncate">{plan.name}</p>
                    <p className="text-ink-3 text-[12px] mt-0.5">{dateLabel} · {plan.city}, {plan.state}</p>
                  </div>
                  <div className="text-right shrink-0 mr-2">
                    <p className="font-medium text-ink text-[13px] tabular-nums">{fmtNaira(plan.totalBudget)}</p>
                    <p className="text-ink-3 text-[11px] mt-0.5">{plan.bidCount ?? 0} bid{plan.bidCount !== 1 ? 's' : ''}</p>
                  </div>
                  {needsCloseout(plan) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-warning/20 text-[#92660A]">
                      Close out →
                    </span>
                  ) : (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${st.style}`}>{st.label}</span>
                  )}
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
