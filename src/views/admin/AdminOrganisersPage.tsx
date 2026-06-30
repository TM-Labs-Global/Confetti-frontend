'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { fmtDate } from '@/shared/utils/format'
import { SingleDatePicker } from '@/features/shared-ui'
import { OrganiserRow, OrganiserStatus } from '@/features/organiser/types/organiser.types'

const STATUS_META: Record<OrganiserStatus, { label: string; style: string }> = {
  active:    { label: 'Active',    style: 'bg-success/15 text-[#39E75F]' },
  suspended: { label: 'Suspended', style: 'bg-red-500/20 text-red-300' },
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
]

export default function AdminOrganisersPage() {
  const [organisers, setOrganisers] = useState<OrganiserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [joinFilter, setJoinFilter] = useState('') // 'YYYY-MM-DD' lower bound, '' = any
  const [busy, setBusy] = useState<string | null>(null)
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  function load() {
    return fetch('/api/organisers')
      .then(r => (r.ok ? r.json() : { organisers: [] }))
      .then(data => setOrganisers(data.organisers ?? []))
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function setStatus(userId: string, status: OrganiserStatus, suspendReason?: string) {
    setBusy(userId)
    try {
      await fetch(`/api/organisers/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: suspendReason }),
      })
      await load()
      setSuspendingId(null)
      setReason('')
    } finally {
      setBusy(null)
    }
  }

  const filtered = organisers.filter(o => {
    if (tab !== 'all' && o.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      if (!`${o.name} ${o.email}`.toLowerCase().includes(q)) return false
    }
    if (joinFilter && o.createdAt.slice(0, 10) < joinFilter) return false
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
    <div className="max-w-[900px] mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-white">Organisers</h1>
        <p className="text-dark-muted text-[14px] mt-1">Review organisers and their events. Suspend an account to block access and pause its live events.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => {
          const count = t.id === 'all' ? organisers.length : organisers.filter(o => o.status === t.id).length
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                tab === t.id ? 'bg-primary text-dark' : 'text-dark-muted hover:text-white hover:bg-white/[0.06]'
              }`}>
              {t.label}<span className="ml-1.5 text-[11px] opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <SingleDatePicker value={joinFilter} onChange={setJoinFilter} placeholder="Joined since" dark />
      </div>
      {joinFilter && (
        <p className="-mt-3 mb-4 text-[12px] text-dark-muted">Showing organisers who joined on or after {fmtDate(joinFilter)}.</p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-12 text-center">
          <p className="text-white font-medium text-[15px]">No organisers here</p>
          <p className="text-dark-muted text-[13px] mt-1">Nothing in this filter yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const st = STATUS_META[o.status]
            return (
              <div key={o.id} className="bg-dark-surface border border-dark-border rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <Link href={`/admin/organisers/${o.id}`} className="group min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-[16px] text-white group-hover:text-primary transition-colors">{o.name}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
                    </div>
                    <p className="text-dark-muted text-[12px] mt-0.5">
                      {o.email} · joined {fmtDate(o.createdAt)} · {o.eventCount} event{o.eventCount !== 1 ? 's' : ''}
                    </p>
                    {o.status === 'suspended' && o.suspensionReason && (
                      <p className="text-red-400 text-[12px] mt-2">Reason sent: {o.suspensionReason}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[12px] text-[#7CE0FF] group-hover:text-white mt-2.5 transition-colors">
                      View events <ChevronRight size={13} />
                    </span>
                  </Link>

                  <div className="flex flex-col gap-2 shrink-0">
                    {o.status === 'suspended' ? (
                      <button onClick={() => setStatus(o.id, 'active')} disabled={busy === o.id}
                        className="px-4 py-1.5 bg-success/15 text-[#39E75F] text-[12px] font-medium rounded-lg hover:bg-success/25 transition-colors disabled:opacity-50">
                        Reinstate
                      </button>
                    ) : (
                      <button onClick={() => { setSuspendingId(suspendingId === o.id ? null : o.id); setReason('') }} disabled={busy === o.id}
                        className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                        Suspend
                      </button>
                    )}
                  </div>
                </div>

                {suspendingId === o.id && (
                  <div className="mt-4 border-t border-dark-border pt-4">
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                      placeholder="Reason for suspension (sent to the organiser)…"
                      className="w-full rounded-lg border border-dark-border bg-dark px-3 py-2 text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary" />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setSuspendingId(null)} className="px-3 py-1.5 text-[12px] text-dark-muted hover:text-white">Cancel</button>
                      <button onClick={() => setStatus(o.id, 'suspended', reason)} disabled={busy === o.id}
                        className="px-4 py-1.5 bg-red-500/20 text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-500/30 disabled:opacity-50">
                        Send & suspend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
