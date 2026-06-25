'use client'
import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Globe, AtSign, Link2, Music2, Phone, Search } from 'lucide-react'
import { fmtDate } from '@/shared/utils/format'
import { SingleDatePicker } from '@/features/shared-ui'
import { VendorProfile, parseSpecialties } from '@/features/vendor/types/vendor.types'

interface VendorRow {
  id: string
  name: string
  email: string
  createdAt: string
  bidCount: number
  vendorProfile: VendorProfile | null
}

const STATUS_META: Record<string, { label: string; style: string }> = {
  verified:  { label: 'Verified',  style: 'bg-success/15 text-[#39E75F]' },
  pending:   { label: 'Pending',   style: 'bg-warning/20 text-[#FFDE59]' },
  rejected:  { label: 'Rejected',  style: 'bg-red-500/15 text-red-400' },
  suspended: { label: 'Suspended', style: 'bg-red-500/20 text-red-300' },
  none:      { label: 'No profile', style: 'bg-white/10 text-dark-muted' },
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'rejected', label: 'Rejected' },
]

// Build a clickable URL from a stored social handle or URL.
function socialHref(kind: string, raw: string): string {
  const v = raw.trim()
  if (kind === 'tel') return `tel:${v.replace(/[^\d+]/g, '')}`
  if (/^https?:\/\//i.test(v)) return v
  const handle = v.replace(/^@/, '')
  if (kind === 'web') return `https://${v}`
  if (kind === 'ig') return `https://instagram.com/${handle}`
  if (kind === 'fb') return `https://facebook.com/${handle}`
  if (kind === 'tt') return `https://www.tiktok.com/@${handle}`
  return v
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [joinFilter, setJoinFilter] = useState('') // 'YYYY-MM-DD' lower bound, '' = any
  const [busy, setBusy] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  function load() {
    return fetch('/api/vendors')
      .then(r => (r.ok ? r.json() : { vendors: [] }))
      .then(data => setVendors(data.vendors ?? []))
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function setStatus(userId: string, status: string, rejectionReason?: string) {
    setBusy(userId)
    try {
      await fetch(`/api/vendors/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason }),
      })
      await load()
      setRejecting(null)
      setReason('')
    } finally {
      setBusy(null)
    }
  }

  // Filter options derived from the vendors present.
  const categoryOptions = useMemo(
    () => [...new Set(vendors.flatMap(v => parseSpecialties(v.vendorProfile?.specialties)))].sort(),
    [vendors],
  )
  const filtered = vendors.filter(v => {
    if (tab !== 'all' && (v.vendorProfile?.status ?? 'none') !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${v.name} ${v.email} ${v.vendorProfile?.businessName ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (categoryFilter !== 'all' && !parseSpecialties(v.vendorProfile?.specialties).includes(categoryFilter)) return false
    if (joinFilter && v.createdAt.slice(0, 10) < joinFilter) return false
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
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-white">Vendors</h1>
        <p className="text-dark-muted text-[14px] mt-1">Review and verify vendors before they can bid on events.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => {
          const count = t.id === 'all' ? vendors.length : vendors.filter(v => (v.vendorProfile?.status ?? 'none') === t.id).length
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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, business or email…"
            className="w-full pl-10 pr-4 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="w-[170px] shrink-0 px-3 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="all">All services</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <SingleDatePicker value={joinFilter} onChange={setJoinFilter} placeholder="Joined since" dark />
      </div>
      {joinFilter && (
        <p className="-mt-3 mb-4 text-[12px] text-dark-muted">Showing vendors who joined on or after {fmtDate(joinFilter)}.</p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-12 text-center">
          <p className="text-white font-medium text-[15px]">No vendors here</p>
          <p className="text-dark-muted text-[13px] mt-1">Nothing in this filter yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => {
            const p = v.vendorProfile
            const status = p?.status ?? 'none'
            const st = STATUS_META[status]
            const specialties = parseSpecialties(p?.specialties)
            const socials = p ? [
              p.website && { id: 'web', Icon: Globe, label: p.website, href: socialHref('web', p.website) },
              p.instagram && { id: 'ig', Icon: AtSign, label: p.instagram.replace(/^@/, ''), href: socialHref('ig', p.instagram) },
              p.facebook && { id: 'fb', Icon: Link2, label: p.facebook, href: socialHref('fb', p.facebook) },
              p.tiktok && { id: 'tt', Icon: Music2, label: p.tiktok.replace(/^@/, ''), href: socialHref('tt', p.tiktok) },
              p.phone && { id: 'tel', Icon: Phone, label: p.phone, href: socialHref('tel', p.phone) },
            ].filter(Boolean) as Array<{ id: string; Icon: any; label: string; href: string }> : []

            return (
              <div key={v.id} className="bg-dark-surface border border-dark-border rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-[16px] text-white">{p?.businessName || v.name}</h3>
                      {status === 'verified' && <BadgeCheck size={15} className="text-success" />}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
                    </div>
                    <p className="text-dark-muted text-[12px] mt-0.5">
                      {v.name} · {v.email} · joined {fmtDate(v.createdAt)} · {v.bidCount} bid{v.bidCount !== 1 ? 's' : ''}
                    </p>
                    {p ? (
                      <>
                        {(p.city || p.state) && <p className="text-dark-muted text-[12px] mt-1.5">{[p.city, p.state].filter(Boolean).join(', ')}</p>}
                        {p.bio && <p className="text-[#C9D0DE] text-[13px] mt-1.5 leading-relaxed">{p.bio}</p>}
                        {specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {specialties.map(s => (
                              <span key={s} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-dark-muted">{s}</span>
                            ))}
                          </div>
                        )}
                        {socials.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-2.5">
                            {socials.map(({ id, Icon, label, href }) => (
                              <a key={id} href={href} target={id === 'tel' ? undefined : '_blank'} rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[12px] text-[#7CE0FF] hover:text-white hover:underline transition-colors">
                                <Icon size={12} /> {label}
                              </a>
                            ))}
                          </div>
                        )}
                        {(status === 'rejected' || status === 'suspended') && p.rejectionReason && (
                          <p className="text-red-400 text-[12px] mt-2">Reason sent: {p.rejectionReason}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-dark-muted text-[13px] mt-2 italic">Hasn't completed onboarding yet.</p>
                    )}
                  </div>

                  {p && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {/* Verify a fresh / re-submitted profile. */}
                      {(status === 'pending' || status === 'none' || status === 'rejected') && (
                        <button onClick={() => setStatus(v.id, 'verified')} disabled={busy === v.id}
                          className="px-4 py-1.5 bg-success/15 text-[#39E75F] text-[12px] font-medium rounded-lg hover:bg-success/25 transition-colors disabled:opacity-50">
                          Verify
                        </button>
                      )}
                      {/* Lift a suspension. */}
                      {status === 'suspended' && (
                        <button onClick={() => setStatus(v.id, 'verified')} disabled={busy === v.id}
                          className="px-4 py-1.5 bg-success/15 text-[#39E75F] text-[12px] font-medium rounded-lg hover:bg-success/25 transition-colors disabled:opacity-50">
                          Reinstate
                        </button>
                      )}
                      {/* Suspend a currently-verified vendor (asks for a reason). */}
                      {status === 'verified' && (
                        <button onClick={() => { setRejecting(rejecting === v.id ? null : v.id); setReason('') }} disabled={busy === v.id}
                          className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                          Suspend
                        </button>
                      )}
                      {/* Reject a pending application (asks for a reason). */}
                      {(status === 'pending' || status === 'none') && (
                        <button onClick={() => { setRejecting(rejecting === v.id ? null : v.id); setReason('') }} disabled={busy === v.id}
                          className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {rejecting === v.id && (
                  <div className="mt-4 border-t border-dark-border pt-4">
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                      placeholder={status === 'verified'
                        ? 'Reason for suspension (sent to the vendor)…'
                        : 'Tell the vendor what to fix (sent to them)…'}
                      className="w-full rounded-lg border border-dark-border bg-dark px-3 py-2 text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary" />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setRejecting(null)} className="px-3 py-1.5 text-[12px] text-dark-muted hover:text-white">Cancel</button>
                      <button onClick={() => setStatus(v.id, status === 'verified' ? 'suspended' : 'rejected', reason)} disabled={busy === v.id}
                        className="px-4 py-1.5 bg-red-500/20 text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-500/30 disabled:opacity-50">
                        Send & {status === 'verified' ? 'suspend' : 'reject'}
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
