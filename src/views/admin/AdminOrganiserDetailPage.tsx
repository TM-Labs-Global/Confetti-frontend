'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '@/shared/utils/format'
import { EventTile } from '@/features/shared-ui'
import { Plan } from '@/features/organiser/types/plan.types'
import { OrganiserDetail, OrganiserStatus } from '@/features/organiser/types/organiser.types'

const ORG_STATUS_META: Record<OrganiserStatus, { label: string; style: string }> = {
  active:    { label: 'Active',    style: 'bg-success/15 text-[#39E75F]' },
  suspended: { label: 'Suspended', style: 'bg-red-500/20 text-red-300' },
}

const PLAN_STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'Vendors booked', style: 'bg-success/15 text-[#166534]' },
  completed:    { label: 'Completed',   style: 'bg-[#F3F4F6] text-[#374151]' },
  disputed:     { label: 'Disputed',    style: 'bg-red-100 text-red-600' },
}

export default function AdminOrganiserDetailPage() {
  const { id } = useParams()
  const [organiser, setOrganiser] = useState<OrganiserDetail | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reason, setReason] = useState('')

  function load() {
    return fetch(`/api/organisers/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        setOrganiser(data?.organiser ?? null)
        setPlans(data?.plans ?? [])
      })
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [id])

  async function setStatus(status: OrganiserStatus, suspendReason?: string) {
    if (!organiser) return
    setBusy(true)
    try {
      await fetch(`/api/organisers/${organiser.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: suspendReason }),
      })
      await load()
      setSuspendOpen(false)
      setReason('')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!organiser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="font-display font-bold text-[20px] text-white">Organiser not found</p>
        <Link href="/admin/organisers" className="text-[13px] text-primary hover:underline">Back to Organisers</Link>
      </div>
    )
  }

  const st = ORG_STATUS_META[organiser.status]

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-dark-muted mb-6">
        <Link href="/admin/organisers" className="hover:text-white transition-colors">Organisers</Link>
        <span>/</span>
        <span className="text-white truncate">{organiser.name}</span>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 mb-7">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-[22px] text-white">{organiser.name}</h1>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
            </div>
            <p className="text-dark-muted text-[13px] mt-1">
              {organiser.email} · joined {fmtDate(organiser.createdAt)} · {plans.length} event{plans.length !== 1 ? 's' : ''}
            </p>
            {organiser.status === 'suspended' && organiser.suspensionReason && (
              <p className="text-red-400 text-[12px] mt-2.5">Reason sent: {organiser.suspensionReason}</p>
            )}
          </div>

          <div className="shrink-0">
            {organiser.status === 'suspended' ? (
              <button onClick={() => setStatus('active')} disabled={busy}
                className="px-4 py-2 bg-success/15 text-[#39E75F] text-[13px] font-medium rounded-lg hover:bg-success/25 transition-colors disabled:opacity-50">
                Reinstate
              </button>
            ) : (
              <button onClick={() => { setSuspendOpen(v => !v); setReason('') }} disabled={busy}
                className="px-4 py-2 bg-red-500/10 text-red-400 text-[13px] font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                Suspend
              </button>
            )}
          </div>
        </div>

        {suspendOpen && (
          <div className="mt-4 border-t border-dark-border pt-4">
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Reason for suspension (sent to the organiser)…"
              className="w-full rounded-lg border border-dark-border bg-dark px-3 py-2 text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary" />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setSuspendOpen(false)} className="px-3 py-1.5 text-[12px] text-dark-muted hover:text-white">Cancel</button>
              <button onClick={() => setStatus('suspended', reason)} disabled={busy}
                className="px-4 py-1.5 bg-red-500/20 text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-500/30 disabled:opacity-50">
                Send & suspend
              </button>
            </div>
          </div>
        )}
      </div>

      <h2 className="font-display font-semibold text-[16px] text-white mb-3">Events</h2>
      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        {plans.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display font-semibold text-white text-[15px] mb-1">No events yet</p>
            <p className="text-dark-muted text-[13px]">This organiser hasn't created any events.</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {plans.map(plan => {
              const meta = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
                ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
              const pst = PLAN_STATUS_META[plan.status as keyof typeof PLAN_STATUS_META] ?? PLAN_STATUS_META.draft
              return (
                <Link key={plan.id} href={`/admin/plans/${plan.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors group"
                >
                  <EventTile type={plan.eventTypeId || ''} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate group-hover:text-primary transition-colors">{plan.name}</p>
                    <p className="text-dark-muted text-[11px] mt-0.5">{plan.city}, {plan.state}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] text-dark-muted mb-0.5">Budget</p>
                      <p className="text-[13px] font-semibold text-white tabular-nums">{fmtNaira(plan.totalBudget)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-dark-muted mb-0.5">Bids</p>
                      <p className="text-[13px] font-semibold text-primary tabular-nums">{plan.bidCount ?? 0}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${pst.style}`}>{pst.label}</span>
                    <svg className="text-dark-muted group-hover:text-primary transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
