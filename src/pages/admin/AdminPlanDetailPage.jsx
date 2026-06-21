'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate, timeAgo } from '../../utils/format'

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'In Progress', style: 'bg-success/15 text-[#166634]' },
  completed:    { label: 'Completed',   style: 'bg-[#F3F4F6] text-[#374151]' },
  disputed:     { label: 'Disputed',    style: 'bg-red-100 text-red-600' },
}

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166634]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
}

export default function AdminPlanDetailPage() {
  const { id } = useParams()
  const [plan, setPlan]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [flagged, setFlagged] = useState(false)

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const p = data?.plan ?? null
        setPlan(p)
        if (p) setFlagged(p.status === 'disputed')
      })
      .finally(() => setLoading(false))
  }, [id])

  async function toggleFlag() {
    const newStatus = flagged ? 'open' : 'disputed'
    const res = await fetch(`/api/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setFlagged(!flagged)
      setPlan(p => ({ ...p, status: newStatus }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="font-display font-bold text-[20px] text-white">Plan not found</p>
        <Link href="/admin/plans" className="text-[13px] text-primary hover:underline">Back to All Plans</Link>
      </div>
    )
  }

  const meta       = EVENT_META[plan.eventTypeId] ?? { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
  const st         = STATUS_META[plan.status] ?? STATUS_META.draft
  const bids       = plan.bids ?? []
  const dateLabel  = plan.dateFlexible ? 'Date not fixed yet' : fmtDate(plan.date)
  const sortedCats = [...(plan.categories ?? [])].sort((a, b) => b.allocation - a.allocation)

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-dark-muted mb-6">
        <Link href="/admin/plans" className="hover:text-white transition-colors">All Plans</Link>
        <span>/</span>
        <span className="text-white truncate">{plan.name}</span>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: meta.bg }}>
            {meta.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-0.5">{plan.eventType?.name}</p>
            <h1 className="font-display font-bold text-[24px] text-white leading-tight">{plan.name}</h1>
            <p className="text-dark-muted text-[13px] mt-1">{dateLabel} · {plan.city}, {plan.state}</p>
          </div>
          <div className="flex items-start gap-3 shrink-0">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${st.style}`}>{st.label}</span>
            <button onClick={toggleFlag}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-medium transition-colors ${
                flagged
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-dark-border text-dark-muted hover:border-red-500/30 hover:text-red-400'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={flagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
              </svg>
              {flagged ? 'Flagged' : 'Flag Plan'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-5 pt-5 border-t border-dark-border">
          <div>
            <p className="text-[11px] text-dark-muted mb-0.5">Total Budget</p>
            <p className="font-display font-bold text-[22px] text-white">{fmtNaira(plan.totalBudget)}</p>
          </div>
          <div>
            <p className="text-[11px] text-dark-muted mb-0.5">Categories</p>
            <p className="font-display font-bold text-[22px] text-white">{(plan.categories ?? []).length}</p>
          </div>
          <div>
            <p className="text-[11px] text-dark-muted mb-0.5">Bids Received</p>
            <p className="font-display font-bold text-[22px] text-primary">{bids.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-dark-surface border border-dark-border rounded-xl p-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-4">Budget Breakdown</p>
          <div className="space-y-3.5">
            {sortedCats.map(cat => {
              const pct     = plan.totalBudget > 0 ? (cat.allocation / plan.totalBudget) * 100 : 0
              const catBids = bids.filter(b => b.planCategoryId === cat.id)
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{cat.name}</span>
                      {catBids.length > 0 && (
                        <span className="text-[10px] text-primary font-mono">{catBids.length} bid{catBids.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <span className="font-semibold text-white tabular-nums">{fmtNaira(cat.allocation)}</span>
                  </div>
                  <div className="h-1.5 bg-dark rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color ?? '#00C4CC' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="col-span-2 bg-dark-surface border border-dark-border rounded-xl p-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-4">
            All Bids ({bids.length})
          </p>
          {bids.length === 0 ? (
            <p className="text-dark-muted text-[13px] text-center py-6">No bids yet.</p>
          ) : (
            <div className="space-y-3">
              {bids.map(bid => {
                const bs = BID_STATUS_META[bid.status] ?? BID_STATUS_META.pending
                return (
                  <div key={bid.id} className="border border-dark-border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">{bid.vendor?.name}</p>
                        <p className="text-[11px] text-dark-muted">{bid.planCategory?.name}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${bs.style}`}>{bs.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-dark-muted text-[11px] line-clamp-1 flex-1 mr-2">{bid.pitch}</p>
                      <p className="font-semibold text-white text-[13px] tabular-nums shrink-0">{fmtNaira(bid.amount)}</p>
                    </div>
                    {bid.isCounterBid && (
                      <p className="text-[10px] text-warning mt-1.5 italic">Counter-bid — {bid.counterReason}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
