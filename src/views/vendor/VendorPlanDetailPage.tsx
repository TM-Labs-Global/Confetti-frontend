'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDateRange, fmtGuests } from '@/shared/utils/format'
import { EventTile, MoneyInput, ConfettiBurst } from '@/features/shared-ui'
import { useAuth } from '@/features/auth/context/AuthContext'
import { Plan, PlanCategory } from '@/features/organiser/types/plan.types'
import { VendorBid } from '@/features/vendor/types/vendor.types'

interface MarketplaceCategory extends Omit<PlanCategory, 'allocation'> {
  allocation: number | null
  eligible?: boolean
  awarded?: boolean
  bids?: VendorBid[]
}

interface MarketplacePlanDetail extends Omit<Plan, 'categories'> {
  categories: MarketplaceCategory[]
}

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166534]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
  held:     { label: 'On hold',  style: 'bg-[#EEF2F7] text-[#475467]' },
}

export default function VendorPlanDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const vendorStatus = user?.vendorProfile?.status ?? null
  const verified = vendorStatus === 'verified'
  const [plan, setPlan]         = useState<MarketplacePlanDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [bidForm, setBidForm]   = useState({ planCategoryId: '', amount: '', pitch: '', isCounterBid: false, counterReason: '' })
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type: string } | null>(null)
  const [celebrate, setCelebrate] = useState(0)
  // Client-only clock so the withdraw window flips live without a hydration mismatch.
  const [nowTs, setNowTs] = useState<number | null>(null)
  useEffect(() => {
    setNowTs(Date.now())
    const t = setInterval(() => setNowTs(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

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
      const data = await res.json().catch(() => null)
      if (!res.ok) { showToast(data?.error ?? 'Failed to submit bid', 'error'); return }
      setBidForm({ planCategoryId: '', amount: '', pitch: '', isCounterBid: false, counterReason: '' })
      showToast('Bid submitted successfully!')
      setCelebrate(c => c + 1)
      await loadPlan()
    } catch {
      showToast('Network error. Check your connection and try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function withdrawBid(bidId: string) {
    setWithdrawingId(bidId)
    try {
      const res = await fetch(`/api/bids/${bidId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok) { showToast(data?.error ?? 'Could not withdraw your bid', 'error'); return }
      showToast('Bid withdrawn')
      await loadPlan()
    } catch {
      showToast('Network error. Check your connection and try again.', 'error')
    } finally {
      setWithdrawingId(null)
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
        <p className="font-display font-bold text-[20px] text-ink">Event not found</p>
        <Link href="/vendor/marketplace" className="text-[13px] text-primary hover:underline">Back to marketplace</Link>
      </div>
    )
  }

  const meta        = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
    ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
    : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
  const dateLabel   = fmtDateRange(plan.startDate, plan.endDate, plan.dateFlexible)
  const sortedCats  = [...(plan.categories ?? [])].sort((a, b) => (b.allocation ?? 0) - (a.allocation ?? 0))
  const myBids      = sortedCats.flatMap(c => c.bids ?? [])
  const acceptedBid = myBids.find(b => b.status === 'accepted')
  // A vendor can only bid on services they offer (eligible), that aren't awarded
  // yet, and that they haven't already bid on.
  const biddableCats = sortedCats.filter(c => c.eligible !== false && !c.awarded && !(c.bids ?? []).length)
  const hasEligible  = sortedCats.some(c => c.eligible !== false)
  const selectedCat = sortedCats.find(c => c.id === bidForm.planCategoryId)
  const isOver      = selectedCat && selectedCat.allocation != null && bidForm.amount && Number(bidForm.amount) > selectedCat.allocation
  // An accepted bid can't be withdrawn in the last 48h; a pending one can be
  // pulled until the event starts. Nothing can be done once it has started.
  const startTs       = plan.startDate ? new Date(plan.startDate).getTime() : null
  const within48h     = !plan.dateFlexible && nowTs != null && startTs != null && nowTs >= startTs - 48 * 60 * 60 * 1000
  const eventStarted  = !plan.dateFlexible && nowTs != null && startTs != null && nowTs >= startTs
  const isCompleted   = plan.status === 'completed'

  return (
    <div className="max-w-[860px] mx-auto">
      {celebrate > 0 && <ConfettiBurst variant="center" fireKey={celebrate} />}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium transition-all ${toast.type === 'error' ? 'bg-red-500 text-[#fff]' : 'bg-dark text-[#fff]'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-2 text-[13px] text-ink-3 mb-6">
        <Link href="/vendor/marketplace" className="hover:text-ink transition-colors">Open Events</Link>
        <span>/</span>
        <span className="text-ink truncate">{plan.name}</span>
      </div>

      {isCompleted && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-canvas px-5 py-3.5">
          {/* Only a vendor who was actually booked gets the "part of it" thanks;
              a vendor whose bids were never accepted gets neutral, honest copy. */}
          <span className="text-xl">{acceptedBid ? '✅' : '🏁'}</span>
          <p className="text-[13px] text-ink-2">
            {acceptedBid
              ? 'This event has wrapped up. Thanks for being part of it!'
              : 'This event has wrapped up. It went ahead with other vendors this time.'}
          </p>
        </div>
      )}

      <div className="bg-white border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <EventTile type={plan.eventTypeId} bg={meta.bg} color={meta.color} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-0.5">{plan.eventType?.name}</p>
            <h1 className="font-display font-bold text-[20px] sm:text-[24px] text-ink leading-tight">{plan.name}</h1>
            <p className="text-ink-3 text-[13px] mt-1">{dateLabel} · {plan.city}, {plan.state}{fmtGuests(plan.guestCount) ? ` · ${fmtGuests(plan.guestCount)}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-4">Services needed</p>
            <div className="space-y-3">
              {sortedCats.map(cat => {
                const eligible = cat.eligible !== false
                const myBidHere = (cat.bids ?? [])[0]
                const pct = eligible && cat.allocation && plan.totalBudget > 0 ? (cat.allocation / plan.totalBudget) * 100 : 0
                return (
                  <div key={cat.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-[13px] mb-1.5">
                      <span className={`font-medium ${eligible ? 'text-ink' : 'text-ink-3'}`}>{cat.name}</span>
                      {eligible
                        ? <span className="text-ink tabular-nums">{fmtNaira(cat.allocation ?? 0)}</span>
                        : <span className="text-[11px] text-ink-3 italic">Not in your services</span>}
                    </div>
                    {eligible && (
                      <div className="h-1.5 bg-canvas rounded-full border border-border overflow-hidden mb-2">
                        <div className="h-full bg-warning/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    {eligible && cat.brief && (
                      <p className="text-[12px] text-ink-2 leading-relaxed mb-2">
                        <span className="text-ink-3">What they want: </span>{cat.brief}
                      </p>
                    )}
                    {myBidHere ? (
                      <div className="text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-3">Your bid: {fmtNaira(myBidHere.amount)}</span>
                          <div className="flex items-center gap-2">
                            {myBidHere.isCounterBid && (
                              <span className="px-1.5 py-0.5 rounded-full font-medium text-[10px] bg-warning/20 text-[#92660A]">Counter bid</span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${BID_STATUS_META[myBidHere.status]?.style ?? ''}`}>
                              {BID_STATUS_META[myBidHere.status]?.label}
                            </span>
                            {(myBidHere.status === 'pending' || myBidHere.status === 'accepted') && (myBidHere.status === 'accepted' ? !within48h : !eventStarted) && (
                              <button
                                onClick={() => {
                                  const msg = myBidHere.status === 'accepted'
                                    ? 'Withdraw this accepted bid? The organiser will be notified and the category reopened.'
                                    : 'Withdraw this bid?'
                                  if (window.confirm(msg)) withdrawBid(myBidHere.id)
                                }}
                                disabled={withdrawingId === myBidHere.id}
                                className="text-red-600 font-medium hover:underline disabled:opacity-50"
                              >
                                {withdrawingId === myBidHere.id ? 'Withdrawing…' : 'Withdraw'}
                              </button>
                            )}
                          </div>
                        </div>
                        {myBidHere.pitch && (
                          <p className="mt-1.5 text-ink-2 leading-relaxed">
                            <span className="text-ink-3">Your pitch: </span>{myBidHere.pitch}
                          </p>
                        )}
                        {myBidHere.isCounterBid && myBidHere.counterReason && (
                          <p className="mt-1 text-[#92660A] leading-relaxed">
                            <span className="text-ink-3">Why above budget: </span>{myBidHere.counterReason}
                          </p>
                        )}
                      </div>
                    ) : cat.awarded ? (
                      <span className="inline-block px-1.5 py-0.5 rounded-full font-medium text-[10px] bg-ink/5 text-ink-3">
                        Awarded to another vendor
                      </span>
                    ) : !eligible ? (
                      <span className="text-[11px] text-ink-3 italic">Not needed for your services</span>
                    ) : verified && !eventStarted ? (
                      <button onClick={() => setBidForm(f => ({ ...f, planCategoryId: cat.id, amount: '' }))}
                        className="text-[12px] text-warning font-medium hover:underline"
                      >
                        + Submit a bid
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {acceptedBid ? (
            <div className="bg-white border border-success/40 rounded-xl p-5 sticky top-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎉</span>
                <p className="font-display font-bold text-[16px] text-ink">You&apos;re in!</p>
              </div>
              <p className="text-[13px] text-ink-2 leading-relaxed mb-3">
                The organiser accepted your bid of <span className="font-mono text-ink">{fmtNaira(acceptedBid.amount)}</span>. They&apos;ll reach out to lock in the details.
              </p>
              <Link href="/vendor/bids" className="text-[12px] text-warning font-medium hover:underline">View in My Bids →</Link>
            </div>
          ) : eventStarted ? (
            <div className="bg-white border border-border rounded-xl p-5 sticky top-4">
              <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-3">Bidding closed</p>
              <p className="text-[13px] text-ink-2 leading-relaxed">This event has already started, so it&apos;s no longer open for new bids.</p>
            </div>
          ) : !hasEligible ? (
            <div className="bg-white border border-border rounded-xl p-5 sticky top-4">
              <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-3">Not a match</p>
              <p className="text-[13px] text-ink-2 leading-relaxed">
                This organiser isn&apos;t looking for any of your registered services, so there&apos;s nothing to bid on here.
              </p>
              <Link href="/vendor/profile" className="mt-3 inline-block text-[12px] text-warning font-medium hover:underline">
                Update your services →
              </Link>
            </div>
          ) : verified && biddableCats.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-5 sticky top-4">
              <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-3">Your bids</p>
              <p className="text-[13px] text-ink-3 leading-relaxed">
                You&apos;ve bid on every open service for this event. Check My Bids for updates from the organiser.
              </p>
            </div>
          ) : (
          <div className="bg-white border border-border rounded-xl p-5 sticky top-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-4">Submit a bid</p>

            {!verified && (
              <div className={`mb-4 rounded-lg border px-4 py-3 text-[12px] ${
                vendorStatus === 'suspended' ? 'border-red-300 bg-red-50 text-red-700' : 'border-warning/40 bg-warning/10 text-ink-2'
              }`}>
                {vendorStatus === 'suspended'
                  ? "Your account is suspended, so you can't bid right now. Check your profile for the reason."
                  : vendorStatus === 'pending'
                    ? "Your profile is under review. You'll be able to bid once an admin verifies you."
                    : vendorStatus === 'rejected'
                      ? 'Your profile needs changes before you can bid.'
                      : 'Complete your vendor profile to start bidding.'}
                <Link href="/vendor/profile" className={`ml-1 font-medium hover:underline ${vendorStatus === 'suspended' ? 'text-red-700' : 'text-warning'}`}>Go to profile →</Link>
              </div>
            )}

            <form onSubmit={submitBid} className={`space-y-4 ${!verified ? 'opacity-50 pointer-events-none' : ''}`} aria-disabled={!verified}>
              <div>
                <label className="block text-[12px] font-medium text-ink-2 mb-1">Service category</label>
                <select value={bidForm.planCategoryId} onChange={e => setBidForm(f => ({ ...f, planCategoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-warning focus:ring-2 focus:ring-warning/10 transition-colors"
                >
                  <option value="">Select a service…</option>
                  {biddableCats.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {fmtNaira(c.allocation ?? 0)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCat?.brief && (
                <div className="rounded-lg border border-border bg-canvas px-3 py-2.5 text-[12px] text-ink-2 leading-relaxed">
                  <span className="text-ink-3">What they want: </span>{selectedCat.brief}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium text-ink-2 mb-1">Your bid amount</label>
                <MoneyInput value={bidForm.amount} onChange={v => setBidForm(f => ({ ...f, amount: v }))} alignRight={false} />
                {selectedCat && selectedCat.allocation != null && (
                  <p className={`text-[11px] mt-1 ${isOver ? 'text-red-500' : 'text-ink-3'}`}>
                    Budget: {fmtNaira(selectedCat.allocation)}{isOver ? '. Your bid exceeds the budget.' : ''}
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

              <button type="submit" disabled={!verified || submitting || !bidForm.planCategoryId || !bidForm.amount}
                className="w-full py-3 bg-warning text-dark text-[13px] font-semibold rounded-xl hover:bg-warning/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Bid'}
              </button>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
