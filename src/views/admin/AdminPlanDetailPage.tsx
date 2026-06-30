'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDateRange, fmtGuests } from '@/shared/utils/format'
import { budgetColor } from '@/shared/utils/palette'
import { EventTile } from '@/features/shared-ui'
import { useAuth } from '@/features/auth/context/AuthContext'
import { Plan } from '@/features/organiser/types/plan.types'
import { VendorBid } from '@/features/vendor/types/vendor.types'

interface AdminBid extends VendorBid {
  vendor?: {
    id: string
    name: string
  }
}

interface AdminPlanDetail extends Plan {
  bids?: AdminBid[]
}

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'Vendors booked', style: 'bg-success/15 text-[#166634]' },
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
  const { user } = useAuth()
  const [plan, setPlan]       = useState<AdminPlanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [flagged, setFlagged] = useState(false)
  const [flagging, setFlagging] = useState(false)
  // Management state (only used for events this admin owns — platform-run events).
  const [accepting, setAccepting]       = useState<string | null>(null)
  const [acceptError, setAcceptError]   = useState<string | null>(null)
  const [decliningId, setDecliningId]   = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completing, setCompleting]     = useState(false)
  // Synchronous guard so a rapid double-click can't fire two requests (which
  // would create duplicate flag/restore notifications).
  const busyRef = useRef(false)
  // "Now" is resolved on the client only (the server has no stable clock), so
  // the time-gated controls never cause a hydration mismatch and flip live.
  const [nowTs, setNowTs] = useState<number | null>(null)
  useEffect(() => {
    setNowTs(Date.now())
    const t = setInterval(() => setNowTs(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  function load() {
    return fetch(`/api/plans/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const p = data?.plan ?? null
        setPlan(p)
        if (p) setFlagged(p.status === 'disputed')
      })
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [id])

  // Restoring from "disputed" should put the event back to its real working
  // status, derived from its bids, never blindly to "open".
  function restoreStatus(): string {
    const cats = plan?.categories ?? []
    const accepted = (plan?.bids ?? []).filter(b => b.status === 'accepted')
    const allAwarded = cats.length > 0 && cats.every(c => accepted.some(b => b.planCategoryId === c.id))
    if (allAwarded) return 'in-progress'
    if ((plan?.bids ?? []).length > 0) return 'bidding'
    return 'open'
  }

  async function toggleFlag() {
    if (busyRef.current) return
    busyRef.current = true
    setFlagging(true)
    const newStatus = flagged ? restoreStatus() : 'disputed'
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setFlagged(!flagged)
        setPlan(p => p ? { ...p, status: newStatus as Plan['status'] } : null)
      }
    } finally {
      busyRef.current = false
      setFlagging(false)
    }
  }

  // ── Management actions (platform-run events only) ──────────────────────────
  async function acceptBid(bidId: string) {
    if (accepting) return
    setAccepting(bidId)
    setAcceptError(null)
    try {
      const res = await fetch(`/api/bids/${bidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        // Budget guard (or any other) rejection — surface the server's message.
        setAcceptError(data?.error || data?.message || 'Could not accept this bid. Please try again.')
      } else {
        await load()
      }
    } finally {
      setAccepting(null)
    }
  }

  async function rejectBid(bidId: string, reason: string) {
    await fetch(`/api/bids/${bidId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', reason: reason.trim() || undefined }),
    })
    setDecliningId(null)
    setDeclineReason('')
    await load()
  }

  async function completeEvent(outcome: 'great' | 'issues') {
    setCompleting(true)
    try {
      await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', outcome }),
      })
      setCompleteOpen(false)
      await load()
    } finally {
      setCompleting(false)
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
        <p className="font-display font-bold text-[20px] text-white">Event not found</p>
        <Link href="/admin/plans" className="text-[13px] text-primary hover:underline">Back to All Events</Link>
      </div>
    )
  }

  const meta       = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
    ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
    : { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
  const st         = STATUS_META[plan.status as keyof typeof STATUS_META] ?? STATUS_META.draft
  const bids       = plan.bids ?? []
  const outcome    = (plan as { outcome?: string }).outcome ?? null
  const dateLabel  = fmtDateRange(plan.startDate, plan.endDate, plan.dateFlexible)
  const sortedCats = [...(plan.categories ?? [])].sort((a, b) => b.allocation - a.allocation)

  // This admin runs platform events they created themselves. Only the owner can
  // manage bids / edit / close the event; for everyone else's events the admin
  // stays in moderation-only mode (flag / restore).
  const isOwner   = !!user && plan.organiserId === user.id
  const started   = !plan.dateFlexible && !!plan.startDate && nowTs !== null && nowTs >= new Date(plan.startDate).getTime()
  const editable  = ['draft', 'open', 'bidding'].includes(plan.status) && !started
  const canComplete = isOwner && (plan.dateFlexible || started) && !['completed', 'disputed'].includes(plan.status)
  const acceptedTotal = bids.filter(b => b.status === 'accepted').reduce((s, b) => s + b.amount, 0)

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-dark-muted mb-6">
        <Link href="/admin/plans" className="hover:text-white transition-colors">All Events</Link>
        <span>/</span>
        <span className="text-white truncate">{plan.name}</span>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 mb-4">
        <div className="flex flex-wrap items-start gap-4">
          <EventTile type={plan.eventTypeId || ''} bg={meta.bg} color={meta.color} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted">{plan.eventType?.name}</p>
              {isOwner && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-[#7CE0FF]">Platform event</span>
              )}
            </div>
            <h1 className="font-display font-bold text-[24px] text-white leading-tight">{plan.name}</h1>
            <p className="text-dark-muted text-[13px] mt-1">{dateLabel} · {plan.city}, {plan.state}{fmtGuests(plan.guestCount) ? ` · ${fmtGuests(plan.guestCount)}` : ''}</p>
            {plan.status === 'completed' && (
              <p className="mt-1.5 text-[12px] text-[#39E75F]">
                Feedback: {outcome === 'great' ? 'It went great 🎉' : outcome === 'issues' ? 'It had some issues 😕' : 'No feedback'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-start gap-3 shrink-0">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${st.style}`}>{st.label}</span>
            {isOwner ? (
              <>
                {editable && (
                  <Link href={`/admin/create-event?edit=${plan.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-dark-border text-dark-muted text-[12px] font-medium hover:border-primary/40 hover:text-white transition-colors">
                    <Pencil size={13} /> Edit
                  </Link>
                )}
                {canComplete && (
                  <button onClick={() => setCompleteOpen(v => !v)} disabled={completing}
                    className="px-3.5 py-2 rounded-lg bg-success/15 text-[#39E75F] text-[12px] font-medium hover:bg-success/25 transition-colors disabled:opacity-50">
                    Mark complete
                  </button>
                )}
              </>
            ) : (
              /* Moderation: a completed event is terminal — it can no longer be flagged. */
              plan.status !== 'completed' && (
                <button onClick={toggleFlag} disabled={flagging}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-medium transition-colors disabled:opacity-50 ${
                    flagged
                      ? 'border-red-500/40 bg-red-500/10 text-red-400'
                      : 'border-dark-border text-dark-muted hover:border-red-500/30 hover:text-red-400'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={flagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
                  </svg>
                  {flagged ? 'Unflag Event' : 'Flag Event'}
                </button>
              )
            )}
          </div>
        </div>

        {/* Close-out confirmation for the platform event owner. */}
        {isOwner && completeOpen && (
          <div className="mt-4 border-t border-dark-border pt-4">
            <p className="text-[13px] text-white mb-3">How did it go? Booked vendors will be told the event is wrapped up.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => completeEvent('great')} disabled={completing}
                className="px-4 py-2 rounded-lg bg-success/15 text-[#39E75F] text-[13px] font-medium hover:bg-success/25 disabled:opacity-50">
                It went great 🎉
              </button>
              <button onClick={() => completeEvent('issues')} disabled={completing}
                className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted text-[13px] font-medium hover:text-white disabled:opacity-50">
                It had some issues
              </button>
              <button onClick={() => setCompleteOpen(false)} className="px-3 py-2 text-[12px] text-dark-muted hover:text-white">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5 pt-5 border-t border-dark-border">
          <div>
            <p className="text-[11px] text-dark-muted mb-0.5">Total Budget</p>
            <p className="font-display font-bold text-[22px] text-white">{fmtNaira(plan.totalBudget)}</p>
          </div>
          <div>
            <p className="text-[11px] text-dark-muted mb-0.5">{isOwner ? 'Awarded' : 'Categories'}</p>
            <p className="font-display font-bold text-[22px] text-white">
              {isOwner ? fmtNaira(acceptedTotal) : (plan.categories ?? []).length}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-dark-muted mb-0.5">Bids Received</p>
            <p className="font-display font-bold text-[22px] text-primary">{bids.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-dark-surface border border-dark-border rounded-xl p-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-4">Budget Breakdown</p>
          <div className="space-y-3.5">
            {sortedCats.map((cat, i) => {
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
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: budgetColor(i) }} />
                  </div>
                  {cat.brief && (
                    <p className="text-[12px] text-dark-muted mt-1.5 leading-relaxed">{cat.brief}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-xl p-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-4">
            All Bids ({bids.length})
          </p>

          {isOwner && bids.some(b => b.status === 'pending') && (
            <p className="text-[12px] text-dark-muted mb-3 leading-snug">
              Accept or decline bids until the event starts. Booking every category moves the event to underway.
            </p>
          )}
          {acceptError && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400 leading-snug">
              {acceptError}
            </p>
          )}

          {bids.length === 0 ? (
            <p className="text-dark-muted text-[13px] text-center py-6">No bids yet.</p>
          ) : (
            <div className="space-y-3">
              {bids.map(bid => {
                const bs = BID_STATUS_META[bid.status] ?? BID_STATUS_META.pending
                const canAct = isOwner && !started && plan.status !== 'completed'
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
                      <p className="text-[10px] text-warning mt-1.5 italic">Counter-bid: {bid.counterReason}</p>
                    )}

                    {/* Owner actions: accept/decline a pending bid, or drop a booked vendor. */}
                    {canAct && decliningId === bid.id ? (
                      <div className="mt-2.5 border-t border-dark-border pt-2.5">
                        <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={2}
                          placeholder="Reason (optional, sent to the vendor)…"
                          className="w-full rounded-lg border border-dark-border bg-dark px-2.5 py-2 text-[12px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary" />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => { setDecliningId(null); setDeclineReason('') }}
                            className="px-2.5 py-1.5 text-[11px] text-dark-muted hover:text-white">Cancel</button>
                          <button onClick={() => rejectBid(bid.id, declineReason)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 text-[11px] font-medium rounded-lg hover:bg-red-500/30">
                            {bid.status === 'accepted' ? 'Drop & notify' : 'Send decline'}
                          </button>
                        </div>
                      </div>
                    ) : canAct && bid.status === 'pending' ? (
                      <div className="mt-2.5 flex gap-2">
                        <button onClick={() => acceptBid(bid.id)} disabled={accepting === bid.id}
                          className="flex-1 px-3 py-1.5 bg-primary text-dark text-[11px] font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                          {accepting === bid.id ? 'Accepting…' : 'Accept'}
                        </button>
                        <button onClick={() => { setDecliningId(bid.id); setDeclineReason('') }}
                          className="px-3 py-1.5 border border-dark-border text-dark-muted text-[11px] font-medium rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
                          Decline
                        </button>
                      </div>
                    ) : canAct && bid.status === 'accepted' ? (
                      <div className="mt-2.5">
                        <button onClick={() => { setDecliningId(bid.id); setDeclineReason('') }}
                          className="text-[11px] text-dark-muted hover:text-red-400 transition-colors">
                          Drop this vendor
                        </button>
                      </div>
                    ) : null}
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
