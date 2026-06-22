'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '@/shared/utils/format'
import { EventTile } from '@/features/shared-ui'
import { Plan, PlanCategory } from '@/features/organiser/types/plan.types'
import { VendorBid } from '@/features/vendor/types/vendor.types'

interface MarketplaceCategory extends PlanCategory {
  bids?: VendorBid[]
}

interface MarketplacePlanDetail extends Omit<Plan, 'categories'> {
  categories: MarketplaceCategory[]
}

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166534]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
}

export default function VendorPlanDetailPage() {
  const { id } = useParams()
  const [plan, setPlan]         = useState<MarketplacePlanDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [bidForm, setBidForm]   = useState({ planCategoryId: '', amount: '', pitch: '', isCounterBid: false, counterReason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type: string } | null>(null)

  function loadPlan() {
    return fetch(`/api/marketplace/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setPlan(data?.plan ?? null))
  }

  useEffect(() => {
    loadPlan().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function showToast(msg: string, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function submitBid(e: React.FormEvent) {
    e.preventDefault()
    if (!bidForm.planCategoryId || !bidForm.amount) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: id,
          planCategoryId: bidForm.planCategoryId,
          amount: Number(bidForm.amount),
          pitch: bidForm.pitch,
          isCounterBid: bidForm.isCounterBid,
          counterReason: bidForm.isCounterBid ? bidForm.counterReason : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Failed to submit bid', 'error'); return }
      setBidForm({ planCategoryId: '', amount: '', pitch: '', isCounterBid: false, counterReason: '' })
      showToast('Bid submitted successfully!')
      await loadPlan()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="font-display font-bold text-[20px] text-ink">Plan not found</p>
        <Link href="/vendor/marketplace" className="text-[13px] text-primary hover:underline">Back to marketplace</Link>
      </div>
    )
  }

  const meta        = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
    ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
    : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
  const dateLabel   = plan.dateFlexible ? 'Flexible date' : fmtDate(plan.date)
  const sortedCats  = [...(plan.categories ?? [])].sort((a, b) => b.allocation - a.allocation)
  const myBid       = sortedCats.flatMap(c => c.bids ?? []).find(b => b)
  const selectedCat = sortedCats.find(c => c.id === bidForm.planCategoryId)
  const isOver      = selectedCat && bidForm.amount && Number(bidForm.amount) > selectedCat.allocation

  return (
    <div className="max-w-[860px] mx-auto">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium transition-all ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-dark text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-2 text-[13px] text-ink-3 mb-6">
        <Link href="/vendor/marketplace" className="hover:text-ink transition-colors">Open Plans</Link>
        <span>/</span>
        <span className="text-ink truncate">{plan.name}</span>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <EventTile type={plan.eventTypeId} bg={meta.bg} color={meta.color} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-0.5">{plan.eventType?.name}</p>
            <h1 className="font-display font-bold text-[24px] text-ink leading-tight">{plan.name}</h1>
            <p className="text-ink-3 text-[13px] mt-1">{dateLabel} · {plan.city}, {plan.state}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-ink-3 mb-0.5">Total budget</p>
            <p className="font-display font-bold text-[26px] text-ink">{fmtNaira(plan.totalBudget)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 space-y-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-4">Services needed</p>
            <div className="space-y-3">
              {sortedCats.map(cat => {
                const myBidHere = (cat.bids ?? [])[0]
                const pct = plan.totalBudget > 0 ? (cat.allocation / plan.totalBudget) * 100 : 0
                return (
                  <div key={cat.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-[13px] mb-1.5">
                      <span className="font-medium text-ink">{cat.name}</span>
                      <span className="text-ink tabular-nums">{fmtNaira(cat.allocation)}</span>
                    </div>
                    <div className="h-1.5 bg-canvas rounded-full border border-border overflow-hidden mb-2">
                      <div className="h-full bg-warning/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    {myBidHere ? (
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-ink-3">Your bid: {fmtNaira(myBidHere.amount)}</span>
                        <span className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${BID_STATUS_META[myBidHere.status]?.style ?? ''}`}>
                          {BID_STATUS_META[myBidHere.status]?.label}
                        </span>
                      </div>
                    ) : (
                      <button onClick={() => setBidForm(f => ({ ...f, planCategoryId: cat.id, amount: '' }))}
                        className="text-[12px] text-warning font-medium hover:underline"
                      >
                        + Submit a bid
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white border border-border rounded-xl p-5 sticky top-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-4">Submit a bid</p>

            <form onSubmit={submitBid} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-ink-2 mb-1">Service category</label>
                <select value={bidForm.planCategoryId} onChange={e => setBidForm(f => ({ ...f, planCategoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-warning focus:ring-2 focus:ring-warning/10 transition-colors"
                >
                  <option value="">Select a service…</option>
                  {sortedCats
                    .filter(c => !(c.bids ?? []).length)
                    .map(c => <option key={c.id} value={c.id}>{c.name} — {fmtNaira(c.allocation)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-ink-2 mb-1">Your bid amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-[13px]">₦</span>
                  <input type="number" value={bidForm.amount} onChange={e => setBidForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0" min="0" required
                    className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-[13px] text-ink focus:outline-none focus:ring-2 transition-colors ${isOver ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : 'border-border focus:border-warning focus:ring-warning/10'}`}
                  />
                </div>
                {selectedCat && (
                  <p className={`text-[11px] mt-1 ${isOver ? 'text-red-500' : 'text-ink-3'}`}>
                    Budget: {fmtNaira(selectedCat.allocation)}{isOver ? ' — your bid exceeds the budget' : ''}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-[12px] text-ink-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={bidForm.isCounterBid} onChange={e => setBidForm(f => ({ ...f, isCounterBid: e.target.checked }))} className="w-3.5 h-3.5 accent-warning" />
                  This is a counter bid (above budget)
                </label>
                {bidForm.isCounterBid && (
                  <textarea value={bidForm.counterReason} onChange={e => setBidForm(f => ({ ...f, counterReason: e.target.value }))}
                    placeholder="Explain why your bid exceeds the budget…"
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-warning focus:ring-2 focus:ring-warning/10 transition-colors resize-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-ink-2 mb-1">Pitch (optional)</label>
                <textarea value={bidForm.pitch} onChange={e => setBidForm(f => ({ ...f, pitch: e.target.value }))}
                  placeholder="Tell the organiser why you're the best choice…"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-warning focus:ring-2 focus:ring-warning/10 transition-colors resize-none"
                />
              </div>

              <button type="submit" disabled={submitting || !bidForm.planCategoryId || !bidForm.amount}
                className="w-full py-3 bg-warning text-dark text-[13px] font-semibold rounded-xl hover:bg-warning/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Bid'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
