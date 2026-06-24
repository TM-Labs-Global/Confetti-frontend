'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { EVENT_META, EVENT_TYPES } from '../../data/mockCategories'
import { fmtNaira } from '@/shared/utils/format'
import { EventTile, DateRangeFilter, type DateFilter } from '@/features/shared-ui'
import { VendorBid } from '@/features/vendor/types/vendor.types'

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166534]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
}

const TABS = [
  { id: 'all',      label: 'All' },
  { id: 'pending',  label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
]

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

export default function VendorBidsPage() {
  const [bids, setBids]       = useState<VendorBid[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all')
  const [search, setSearch]   = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>({ kind: 'all' })

  useEffect(() => {
    fetch('/api/bids')
      .then(r => r.ok ? r.json() : { bids: [] })
      .then(data => setBids(data.bids ?? []))
      .finally(() => setLoading(false))
  }, [])

  const states = useMemo(
    () => [...new Set(bids.map(b => b.plan?.state).filter(Boolean) as string[])].sort(),
    [bids],
  )
  const months = useMemo(() => {
    const keys = [...new Set(bids.map(b => monthKey(b.plan?.dateFlexible ? null : b.plan?.startDate)))]
    return keys.sort((a, b) => (a === 'flexible' ? 1 : b === 'flexible' ? -1 : a.localeCompare(b)))
  }, [bids])

  const filtered = bids.filter(b => {
    if (tab !== 'all' && (b.status as string) !== tab) return false
    if (search && !(b.plan?.name ?? '').toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && b.plan?.eventTypeId !== typeFilter) return false
    if (stateFilter !== 'all' && b.plan?.state !== stateFilter) return false

    const planDay = b.plan?.dateFlexible ? null : dayKey(b.plan?.startDate)
    if (dateFilter.kind === 'flexible' && planDay !== null) return false
    if (dateFilter.kind === 'month' && monthKey(b.plan?.dateFlexible ? null : b.plan?.startDate) !== dateFilter.key) return false
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
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-ink">My Bids</h1>
      </div>

      <div className="flex flex-wrap gap-1 mb-5">
        {TABS.map(t => {
          const count = t.id === 'all' ? bids.length : bids.filter(b => (b.status as string) === t.id).length
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                tab === t.id ? 'bg-primary text-dark' : 'text-ink-3 hover:text-ink hover:bg-canvas'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[11px] ${tab === t.id ? 'text-dark/60' : 'text-ink-3'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by event…"
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
          <p className="text-[24px] mb-3">📋</p>
          <p className="font-display font-bold text-[18px] text-ink mb-1">
            {bids.length === 0 ? 'No bids yet' : 'No bids match your filters'}
          </p>
          <p className="text-ink-3 text-[14px] mb-5">
            {bids.length === 0 ? 'Browse open events and submit your first bid.' : 'Try a different status, event, location, or date.'}
          </p>
          {bids.length === 0 && (
            <Link href="/vendor/marketplace"
              className="inline-flex px-6 py-2.5 bg-warning text-dark text-[13px] font-semibold rounded-lg hover:bg-warning/90 transition-colors"
            >
              Browse Events
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map(bid => {
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-ink-3 text-[12px]">{bid.planCategory?.name}</p>
                      {bid.isCounterBid && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-warning/20 text-[#92660A] rounded-full font-medium">Counter bid</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-ink text-[14px] tabular-nums">{fmtNaira(bid.amount)}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${bs.style}`}>{bs.label}</span>
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
