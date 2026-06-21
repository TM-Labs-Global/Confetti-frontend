'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166534]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
}

export default function PlanDetailPage() {
  const { id }   = useParams()
  const [plan, setPlan]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)
  const [accepting, setAccepting] = useState(null)

  function loadPlan() {
    return fetch(`/api/plans/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setPlan(data?.plan ?? null))
  }

  useEffect(() => {
    loadPlan().finally(() => setLoading(false))
  }, [id])

  async function acceptBid(bidId) {
    setAccepting(bidId)
    await fetch(`/api/bids/${bidId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    await loadPlan()
    setAccepting(null)
  }

  async function rejectBid(bidId) {
    await fetch(`/api/bids/${bidId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    })
    await loadPlan()
  }

  async function publishPlan() {
    const res = await fetch(`/api/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'open' }),
    })
    if (res.ok) await loadPlan()
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
        <p className="font-display font-bold text-[20px] text-ink">Plan not found</p>
        <Link href="/organiser/plans" className="text-[13px] text-primary hover:underline">Back to My Plans</Link>
      </div>
    )
  }

  const meta       = EVENT_META[plan.eventTypeId] ?? { emoji: '🎉', bg: '#F5F5F5' }
  const st         = STATUS_META[plan.status] ?? STATUS_META.draft
  const planBids   = plan.bids ?? []
  const totalAlloc = (plan.categories ?? []).reduce((s, c) => s + c.allocation, 0)
  const dateLabel  = plan.dateFlexible ? 'Date not fixed yet' : fmtDate(plan.date)
  const sortedCats = [...(plan.categories ?? [])].sort((a, b) => b.allocation - a.allocation)

  function copyShareCode() {
    navigator.clipboard?.writeText(plan.shareCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-[860px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-ink-3 mb-6">
        <Link href="/organiser/plans" className="hover:text-ink transition-colors">My Plans</Link>
        <span>/</span>
        <span className="text-ink truncate">{plan.name}</span>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: meta.bg }}>
            {meta.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">{plan.eventType?.name}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
            </div>
            <h1 className="font-display font-bold text-[24px] text-ink leading-tight">{plan.name}</h1>
            <p className="text-ink-3 text-[13px] mt-1">{dateLabel} · {plan.city}, {plan.state}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-ink-3 mb-0.5">Total budget</p>
            <p className="font-display font-bold text-[26px] text-ink">{fmtNaira(plan.totalBudget)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-border">
          {plan.status === 'draft' && (
            <button onClick={publishPlan}
              className="px-5 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              Find Me Vendors →
            </button>
          )}
          <button onClick={copyShareCode}
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-ink-2 text-[13px] font-medium rounded-lg hover:bg-canvas transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {copied ? 'Copied!' : `Share · ${plan.shareCode}`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">Budget breakdown</p>
            <p className="text-[12px] text-ink-3 tabular-nums">{fmtNaira(totalAlloc)} allocated</p>
          </div>
          <div className="space-y-3.5">
            {sortedCats.map(cat => {
              const pct      = plan.totalBudget > 0 ? (cat.allocation / plan.totalBudget) * 100 : 0
              const catBids  = planBids.filter(b => b.planCategoryId === cat.id)
              const accepted = catBids.find(b => b.status === 'accepted')
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-ink-2">{cat.name}</span>
                      {accepted && <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-[#166534]">Vendor selected</span>}
                      {!accepted && catBids.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{catBids.length} bid{catBids.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <span className="font-medium text-ink tabular-nums">{fmtNaira(cat.allocation)}</span>
                  </div>
                  <div className="h-1.5 bg-canvas rounded-full border border-border overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-3">Bids</p>
            {planBids.length === 0 ? (
              <p className="text-ink-3 text-[13px]">
                {plan.status === 'draft'
                  ? 'Publish your plan to start receiving bids.'
                  : 'No bids yet. Vendors will start reaching out soon.'}
              </p>
            ) : (
              <div className="space-y-3">
                {planBids.map(bid => {
                  const bs = BID_STATUS_META[bid.status] ?? BID_STATUS_META.pending
                  return (
                    <div key={bid.id} className="text-[13px]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate">{bid.vendor?.name}</p>
                          <p className="text-ink-3 text-[11px]">{bid.planCategory?.name}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-semibold text-ink tabular-nums">{fmtNaira(bid.amount)}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${bs.style}`}>{bs.label}</span>
                        </div>
                      </div>
                      {bid.status === 'pending' && (
                        <div className="flex gap-2 mt-1.5">
                          <button onClick={() => acceptBid(bid.id)} disabled={accepting === bid.id}
                            className="flex-1 py-1.5 bg-success/10 text-[#166534] text-[11px] font-medium rounded-lg hover:bg-success/20 transition-colors disabled:opacity-50">
                            Accept
                          </button>
                          <button onClick={() => rejectBid(bid.id)}
                            className="flex-1 py-1.5 bg-red-50 text-red-600 text-[11px] font-medium rounded-lg hover:bg-red-100 transition-colors">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-3">Details</p>
            <dl className="space-y-2.5">
              {[
                { label: 'Categories', value: `${(plan.categories ?? []).length} services` },
                { label: 'Share code', value: plan.shareCode },
                { label: 'Created',    value: fmtDate(plan.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-[13px]">
                  <dt className="text-ink-3">{label}</dt>
                  <dd className="font-medium text-ink font-mono text-[12px]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
