'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Pencil, BadgeCheck, Phone, Lock, CheckCircle2, Clock, Landmark, MapPin, Users, Radio } from 'lucide-react'
import { EventTile, ConfettiBurst } from '@/features/shared-ui'
import { useAuth } from '@/features/auth/context/AuthContext'
import { VendorProfileModal } from '@/features/vendor/components/VendorProfileModal'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate, fmtDateRange, fmtGuests } from '@/shared/utils/format'
import { budgetColor } from '@/shared/utils/palette'
import { Plan } from '@/features/organiser/types/plan.types'
import { VendorBid } from '@/features/vendor/types/vendor.types'

interface OrganizerBid extends VendorBid {
  vendor?: {
    id: string
    name: string
    vendorProfile?: {
      status: string
      businessName: string
      phone?: string | null
      address?: string | null
      bankName?: string | null
      bankAccountNumber?: string | null
      bankAccountName?: string | null
    } | null
  }
}

interface OrganizerPlanDetail extends Plan {
  bids?: OrganizerBid[]
}

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'Vendors booked', style: 'bg-success/15 text-[#166534]' },
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
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const searchParams              = useSearchParams()
  const [plan, setPlan]         = useState<OrganizerPlanDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(searchParams.get('published') === 'true')
  const [viewVendor, setViewVendor] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [showCloseout, setShowCloseout] = useState(false)
  // Resolved on the client only, so the time-based UI never causes a hydration
  // mismatch (server has no stable "now").
  const [nowTs, setNowTs] = useState<number | null>(null)
  useEffect(() => {
    setNowTs(Date.now())
    // Tick so the 48h-lock / event-passed UI flips live without a reload.
    const t = setInterval(() => setNowTs(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  function loadPlan() {
    return fetch(`/api/plans/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setPlan(data?.plan ?? null))
  }

  useEffect(() => {
    loadPlan().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function acceptBid(bidId: string) {
    setAccepting(bidId)
    setAcceptError(null)
    const res = await fetch(`/api/bids/${bidId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    if (!res.ok) {
      // Budget guard (or any other) rejection - surface the server's message.
      const data = await res.json().catch(() => null)
      setAcceptError(data?.error || data?.message || 'Could not accept this bid. Please try again.')
      setAccepting(null)
      return
    }
    await loadPlan()
    setAccepting(null)
  }

  async function rejectBid(bidId: string, reason: string) {
    await fetch(`/api/bids/${bidId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', reason: reason.trim() || undefined }),
    })
    setDecliningId(null)
    setDeclineReason('')
    await loadPlan()
  }

  async function publishPlan() {
    // "Let the Bids Roll In" means broadcast: open the event AND list it for bids.
    const res = await fetch(`/api/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'open', openToBids: true }),
    })
    if (res.ok) { await loadPlan(); setCelebrate(true) }
  }

  // Toggle whether the event is broadcast to the open vendor marketplace.
  const [togglingBids, setTogglingBids] = useState(false)
  async function setOpenToBids(next: boolean) {
    setTogglingBids(true)
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openToBids: next }),
      })
      if (res.ok) await loadPlan()
    } finally {
      setTogglingBids(false)
    }
  }

  async function completeEvent(outcome: 'great' | 'issues') {
    setCompleting(true)
    try {
      await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', outcome }),
      })
      await loadPlan()
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
        <p className="font-display font-bold text-[20px] text-ink">Event not found</p>
        <Link href="/organiser/plans" className="text-[13px] text-primary hover:underline">Back to My Events</Link>
      </div>
    )
  }

  const meta       = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
    ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
    : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
  const st         = STATUS_META[plan.status as keyof typeof STATUS_META] ?? STATUS_META.draft
  const planBids   = plan.bids ?? []
  const totalAlloc = (plan.categories ?? []).reduce((s, c) => s + c.allocation, 0)
  const acceptedTotal = planBids.filter(b => b.status === 'accepted').reduce((s, b) => s + b.amount, 0)
  const hasAccepted   = acceptedTotal > 0
  const remaining     = plan.totalBudget - acceptedTotal
  const dateLabel  = fmtDateRange(plan.startDate, plan.endDate, plan.dateFlexible)
  const sortedCats = [...(plan.categories ?? [])].sort((a, b) => b.allocation - a.allocation)
  const canEdit    = plan.status === 'draft' || plan.status === 'open' || plan.status === 'bidding'

  // ── Event-time lifecycle ──────────────────────────────────────────────
  // Vendors can't be changed within 48h of the start (protects booked vendors);
  // once the event has ended the organiser closes it out.
  const LOCK_MS    = 48 * 60 * 60 * 1000
  const startTs    = plan.startDate ? new Date(plan.startDate).getTime() : null
  const endTs      = plan.endDate ? new Date(plan.endDate).getTime() : startTs
  const outcome    = (plan as { outcome?: string }).outcome ?? null
  const isCompleted = plan.status === 'completed'
  // Only apply time rules after the client clock resolves (nowTs !== null).
  const vendorsLocked = !plan.dateFlexible && nowTs != null && startTs != null && nowTs >= startTs - LOCK_MS
  const eventStarted  = !plan.dateFlexible && nowTs != null && startTs != null && nowTs >= startTs
  const eventPassed   = !plan.dateFlexible && nowTs != null && endTs != null && nowTs > endTs
  const needsCloseout = eventPassed && !isCompleted
  // Editing closes once the event has started (even while still "bidding").
  const editable      = canEdit && !eventStarted
  // Manual close-out is offered for events that are clearly under way or undated
  // (flexible) but never for a purely-future dated event.
  const canManualComplete = !isCompleted && nowTs != null && (plan.dateFlexible || (startTs != null && nowTs >= startTs))
  const closeoutOpen = needsCloseout || showCloseout

  function copyShareLink() {
    if (plan?.shareCode) {
      const link = `${window.location.origin}/p/${plan.shareCode}`
      navigator.clipboard?.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-[860px] mx-auto">
      {celebrate && <ConfettiBurst variant="center" />}
      {celebrate && (
        <div className="bg-success/10 border border-success/30 rounded-xl px-5 py-3.5 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-medium text-ink text-[14px]">Your event is live!</p>
              <p className="text-ink-3 text-[12px]">Vendors can now browse it and submit bids.</p>
            </div>
          </div>
          <button onClick={() => setCelebrate(false)} className="text-ink-3 hover:text-ink text-[18px] leading-none">×</button>
        </div>
      )}

      <div className="flex items-center gap-2 text-[13px] text-ink-3 mb-6">
        <Link href="/organiser/plans" className="hover:text-ink transition-colors">My Events</Link>
        <span>/</span>
        <span className="text-ink truncate">{plan.name}</span>
      </div>

      {isCompleted ? (
        <div className="bg-success/10 border border-success/30 rounded-xl px-5 py-4 flex items-center gap-3 mb-5">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium text-ink text-[14px]">This event is done and dusted.</p>
            <p className="text-ink-3 text-[12px]">
              Feedback: {outcome === 'great' ? 'It went great 🎉' : outcome === 'issues' ? 'It had some issues 😕' : 'No feedback'}
              {' · '}It&apos;s now closed, thanks for using Confette.
            </p>
          </div>
        </div>
      ) : closeoutOpen ? (
        <div className="bg-white border border-border rounded-xl px-5 py-4 mb-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div className="flex-1">
              <p className="font-medium text-ink text-[14px]">How did the event go, {firstName}?</p>
              <p className="text-ink-3 text-[12px] mb-3">
                {needsCloseout ? 'The date has passed. ' : ''}Let us know how it went, then we&apos;ll close it out.
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => completeEvent('great')} disabled={completing}
                  className="px-4 py-2 rounded-lg bg-success/10 text-[#166534] text-[13px] font-medium hover:bg-success/20 transition-colors disabled:opacity-50">
                  🎉 It went great
                </button>
                <button onClick={() => completeEvent('issues')} disabled={completing}
                  className="px-4 py-2 rounded-lg bg-warning/15 text-[#92660A] text-[13px] font-medium hover:bg-warning/25 transition-colors disabled:opacity-50">
                  😕 It had some issues
                </button>
                {!needsCloseout && (
                  <button onClick={() => setShowCloseout(false)} disabled={completing}
                    className="px-4 py-2 rounded-lg border border-border text-ink-2 text-[13px] font-medium hover:bg-canvas transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : plan.status === 'in-progress' && (
        <div className="bg-success/10 border border-success/30 rounded-xl px-5 py-4 flex items-center gap-3 mb-5">
          <span className="text-2xl">🎊</span>
          <div>
            <p className="font-medium text-ink text-[14px]">Your vendors are all set, {firstName}!</p>
            <p className="text-ink-3 text-[12px]">Every service has a confirmed vendor. Relax and enjoy your event.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <EventTile type={plan.eventTypeId || ''} bg={meta.bg} color={meta.color} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">{plan.eventType?.name}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
            </div>
            <h1 className="font-display font-bold text-[24px] text-ink leading-tight">{plan.name}</h1>
            <p className="text-ink-3 text-[13px] mt-1">{dateLabel} · {plan.city}, {plan.state}{fmtGuests(plan.guestCount) ? ` · ${fmtGuests(plan.guestCount)}` : ''}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-ink-3 mb-0.5">Total budget</p>
            <p className="font-display font-bold text-[26px] text-ink">{fmtNaira(plan.totalBudget)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-border">
          {plan.status === 'draft' && (
            <button onClick={publishPlan}
              className="px-5 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              Let the Bids Roll In →
            </button>
          )}
          {editable && (
            <Link href={`/organiser/create-plan?edit=${plan.id}`}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-ink-2 text-[13px] font-medium rounded-lg hover:bg-canvas transition-colors">
              <Pencil size={14} />
              Edit plan
            </Link>
          )}
          {plan.status !== 'draft' && (
            <button onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-ink-2 text-[13px] font-medium rounded-lg hover:bg-canvas transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {copied ? 'Link copied!' : 'Copy share link'}
              <span className="font-mono text-[11px] text-ink-3 pl-1.5 ml-1.5 border-l border-border">{plan.shareCode}</span>
            </button>
          )}
          {(plan.status === 'open' || plan.status === 'bidding') && editable && (
            <Link href={`/organiser/marketplace?plan=${plan.id}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary text-[13px] font-medium rounded-lg hover:bg-primary/20 transition-colors">
              <Users size={14} /> Find vendors
            </Link>
          )}
          {(plan.status === 'open' || plan.status === 'bidding') && editable && (
            <button onClick={() => setOpenToBids(!plan.openToBids)} disabled={togglingBids}
              title={plan.openToBids
                ? 'Listed in the vendor marketplace. Click to make it invite-only.'
                : 'Hidden from the marketplace. Click to open it for bids.'}
              className={`flex items-center gap-2 px-4 py-2.5 border text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50 ${plan.openToBids ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border text-ink-2 hover:bg-canvas'}`}>
              <Radio size={14} /> {plan.openToBids ? 'Open to bids' : 'Invite-only'}
            </button>
          )}
          {(plan.status === 'open' || plan.status === 'bidding') && editable && !plan.openToBids && (
            <p className="w-full flex items-start gap-1.5 text-[12px] text-ink-3 mt-1">
              <Radio size={12} className="mt-px shrink-0" />
              This event is invite-only, so it&apos;s hidden from the marketplace. Only vendors you invite can bid. Turn on &quot;Open to bids&quot; to list it for everyone.
            </p>
          )}
          {canManualComplete && !closeoutOpen && (
            <button onClick={() => setShowCloseout(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-ink-2 text-[13px] font-medium rounded-lg hover:bg-canvas transition-colors">
              <CheckCircle2 size={14} /> Mark event done
            </button>
          )}
          {!editable && plan.status !== 'draft' && (
            <p className="w-full flex items-center gap-1.5 text-[12px] text-ink-3 mt-1">
              <Lock size={12} />
              {plan.status === 'completed'
                ? 'This event is closed, so its details are locked.'
                : plan.status === 'disputed'
                  ? 'Locked while an admin reviews this event.'
                  : eventStarted
                    ? 'This event has already started, so it can no longer be edited.'
                    : 'Editing is locked once vendors are booked. Withdraw a vendor first to make changes.'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">Budget breakdown</p>
            <p className="text-[12px] text-ink-3 tabular-nums">{fmtNaira(totalAlloc)} allocated</p>
          </div>
          <div className="space-y-3.5">
            {sortedCats.map((cat, i) => {
              const pct      = plan.totalBudget > 0 ? (cat.allocation / plan.totalBudget) * 100 : 0
              const barColor = budgetColor(i)
              const catBids  = planBids.filter(b => b.planCategoryId === cat.id)
              const accepted = catBids.find(b => b.status === 'accepted')
              const diff     = accepted ? cat.allocation - accepted.amount : 0
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-ink-2">{cat.name}</span>
                      {!accepted && catBids.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{catBids.length} bid{catBids.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <span className="font-medium text-ink tabular-nums">{fmtNaira(cat.allocation)}</span>
                  </div>
                  <div className="h-1.5 bg-canvas rounded-full border border-border overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                  {(cat.lineItems?.length ?? 0) > 1 && (
                    <div className="mt-1.5 space-y-0.5">
                      {cat.lineItems!.map(li => (
                        <div key={li.id} className="flex items-center justify-between text-[12px] text-ink-3">
                          <span className="truncate pr-2">{li.name || cat.name}{li.quantity > 1 ? ` ×${li.quantity}` : ''}</span>
                          <span className="font-mono tabular-nums shrink-0">{fmtNaira(li.quantity * li.unitCost)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {cat.brief && (
                    <p className="text-[12px] text-ink-3 mt-1.5 leading-relaxed">{cat.brief}</p>
                  )}
                  {accepted && (
                    <p className="text-[11px] text-ink-3 mt-1 tabular-nums">
                      Awarded at {fmtNaira(accepted.amount)} ·{' '}
                      {diff >= 0
                        ? <span className="text-[#166534]">{fmtNaira(diff)} under</span>
                        : <span className="text-red-600">{fmtNaira(-diff)} over</span>}
                    </p>
                  )}
                  {(plan.status === 'open' || plan.status === 'bidding') && editable && !accepted && (
                    <Link href={`/organiser/marketplace?plan=${plan.id}&category=${cat.id}`}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                      <Users size={11} /> Find {cat.name.toLowerCase()} vendors →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {hasAccepted && (
            <div className="mt-5 pt-4 border-t border-border space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-ink-3">Committed to vendors</span>
                <span className="font-medium text-ink tabular-nums">{fmtNaira(acceptedTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-ink">Remaining budget</span>
                <span className={`font-semibold tabular-nums ${remaining >= 0 ? 'text-[#166534]' : 'text-red-600'}`}>
                  {remaining >= 0 ? fmtNaira(remaining) : `-${fmtNaira(-remaining)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-3">Bids</p>
            {planBids.some(b => b.status === 'pending') && !eventStarted && (
              <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-canvas px-3 py-2 text-[11px] text-ink-3">
                <Clock size={13} className="shrink-0 mt-px text-ink-3" />
                You can accept or decline bids until the event starts. Once you book a vendor, you can&apos;t drop them in the last 48 hours.
              </p>
            )}
            {acceptError && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                <p className="text-[12px] text-red-600 leading-snug">{acceptError}</p>
              </div>
            )}
            {planBids.length === 0 ? (
              <p className="text-ink-3 text-[13px]">
                {plan.status === 'draft'
                  ? 'Publish your event to start receiving bids.'
                  : 'No bids yet. Vendors will start reaching out soon.'}
              </p>
            ) : (
              <div className="space-y-3">
                {planBids.map(bid => {
                  const bs = BID_STATUS_META[bid.status] ?? BID_STATUS_META.pending
                  const bidCat = (plan.categories ?? []).find(c => c.id === bid.planCategoryId)
                  const overCat = bidCat ? bid.amount - bidCat.allocation : 0
                  return (
                    <div key={bid.id} className="text-[13px]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="min-w-0">
                          <button
                            onClick={() => bid.vendor?.id && setViewVendor(bid.vendor.id)}
                            className="flex items-center gap-1 font-medium text-ink hover:text-primary transition-colors truncate"
                          >
                            <span className="truncate">{bid.vendor?.vendorProfile?.businessName || bid.vendor?.name}</span>
                            {bid.vendor?.vendorProfile?.status === 'verified' && (
                              <BadgeCheck size={13} className="text-success shrink-0" />
                            )}
                          </button>
                          <p className="text-ink-3 text-[11px]">{bid.planCategory?.name}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-semibold text-ink tabular-nums">{fmtNaira(bid.amount)}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${bs.style}`}>{bs.label}</span>
                        </div>
                      </div>
                      {bid.pitch && <p className="text-ink-2 text-[12px] leading-relaxed mb-1.5 line-clamp-3">{bid.pitch}</p>}
                      {bid.isCounterBid && bid.counterReason && (
                        <p className="text-[12px] text-[#92660A] leading-relaxed mb-1.5">
                          <span className="text-ink-3">Why above budget: </span>{bid.counterReason}
                        </p>
                      )}
                      {decliningId === bid.id ? (
                        <div className="mt-1.5 space-y-1.5">
                          <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)}
                            placeholder="Reason for declining (the vendor will see this)…" rows={2}
                            className="w-full px-2.5 py-1.5 border border-border rounded-lg text-[12px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => rejectBid(bid.id, declineReason)}
                              className="flex-1 py-1.5 bg-red-50 text-red-600 text-[11px] font-medium rounded-lg hover:bg-red-100 transition-colors">
                              {bid.status === 'accepted' ? 'Withdraw & notify vendor' : 'Send decline'}
                            </button>
                            <button onClick={() => { setDecliningId(null); setDeclineReason('') }}
                              className="px-3 py-1.5 border border-border text-ink-2 text-[11px] font-medium rounded-lg hover:bg-canvas transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : bid.status === 'pending' ? (
                        <>
                        {overCat > 0 && (
                          <p className="mb-1.5 flex items-start gap-1.5 text-[11px] text-[#92660A]">
                            <span aria-hidden>⚠️</span>
                            <span>This bid is {fmtNaira(overCat)} above the {fmtNaira(bidCat!.allocation)} you set for {bidCat!.name}.</span>
                          </p>
                        )}
                        {!eventStarted ? (
                          <div className="flex gap-2 mt-1.5">
                            <button onClick={() => acceptBid(bid.id)} disabled={accepting === bid.id}
                              className="flex-1 py-1.5 bg-success/10 text-[#166534] text-[11px] font-medium rounded-lg hover:bg-success/20 transition-colors disabled:opacity-50">
                              Accept
                            </button>
                            <button onClick={() => { setDecliningId(bid.id); setDeclineReason('') }}
                              className="flex-1 py-1.5 bg-red-50 text-red-600 text-[11px] font-medium rounded-lg hover:bg-red-100 transition-colors">
                              Decline
                            </button>
                          </div>
                        ) : (
                          <p className="mt-1.5 text-[11px] text-ink-3">This event has started, so bids are closed.</p>
                        )}
                        </>
                      ) : null}
                      {bid.status === 'accepted' && decliningId !== bid.id && (
                        <>
                          {bid.vendor?.vendorProfile?.phone && (
                            <a href={`tel:${bid.vendor.vendorProfile.phone.replace(/\s/g, '')}`}
                              className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1.5 text-[12px] font-medium text-[#166534] hover:bg-success/20 transition-colors">
                              <Phone size={12} /> {bid.vendor.vendorProfile.phone}
                            </a>
                          )}
                          {bid.vendor?.vendorProfile?.address && (
                            <p className="mt-1.5 flex items-start gap-1.5 text-[12px] text-ink-2">
                              <MapPin size={12} className="mt-0.5 shrink-0 text-ink-3" /> {bid.vendor.vendorProfile.address}
                            </p>
                          )}
                          {bid.vendor?.vendorProfile?.bankAccountName && bid.vendor?.vendorProfile?.bankAccountNumber && (
                            <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-canvas border border-border px-2.5 py-1.5 text-[12px] text-ink-2">
                              <Landmark size={12} className="mt-0.5 shrink-0 text-ink-3" />
                              <span>
                                <span className="font-medium text-ink">{bid.vendor.vendorProfile.bankAccountName}</span>
                                {' · '}{bid.vendor.vendorProfile.bankName}
                                {' · '}<span className="font-mono">{bid.vendor.vendorProfile.bankAccountNumber}</span>
                              </span>
                            </div>
                          )}
                          {vendorsLocked ? (
                            <p className="mt-2 text-[11px] text-ink-3">
                              {eventPassed ? 'This event has passed, so this vendor is final.' : "It's within 48 hours of the event, so this vendor is locked in."}
                            </p>
                          ) : (
                            <button type="button" onClick={() => { setDecliningId(bid.id); setDeclineReason('') }}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-ink-2 cursor-pointer hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600 transition-colors">
                              <Pencil size={12} /> Change decision
                            </button>
                          )}
                        </>
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
                { label: 'Guests',     value: fmtGuests(plan.guestCount) || 'Not set' },
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

      {viewVendor && <VendorProfileModal userId={viewVendor} onClose={() => setViewVendor(null)} />}
    </div>
  )
}
