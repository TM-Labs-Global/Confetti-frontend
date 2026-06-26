'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, MapPin, Search, UserPlus, X, Send, Check } from 'lucide-react'
import { VendorProfileModal } from '@/features/vendor/components/VendorProfileModal'
import { parseSpecialties } from '@/features/vendor/types/vendor.types'
import { Plan } from '@/features/organiser/types/plan.types'

interface BrowseVendor {
  userId: string
  businessName: string
  bio: string
  state: string
  city: string
  specialties: string
  website: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  status: string
  user?: { name: string | null } | null
}

interface SentInvite {
  vendorId: string
  planId: string
  planCategoryId: string
}

export default function OrganiserVendorsPage() {
  const [vendors, setVendors] = useState<BrowseVendor[]>([])
  const [plans, setPlans]     = useState<Plan[]>([])
  const [invites, setInvites] = useState<SentInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [service, setService] = useState('all')
  const [state, setState]     = useState('all')
  const [viewId, setViewId]   = useState<string | null>(null)
  const [inviteVendor, setInviteVendor] = useState<BrowseVendor | null>(null)
  const [toast, setToast]     = useState<{ msg: string; type: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/vendors/browse').then(r => (r.ok ? r.json() : { vendors: [] })),
      fetch('/api/plans').then(r => (r.ok ? r.json() : { plans: [] })),
      fetch('/api/vendors/sent-invites').then(r => (r.ok ? r.json() : { invitations: [] })),
    ])
      .then(([v, p, i]) => {
        setVendors(v.vendors ?? [])
        setPlans(p.plans ?? [])
        setInvites(i.invitations ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  // Has this vendor been invited to *any* slot yet? Used for the card badge.
  const invitedVendorIds = useMemo(() => new Set(invites.map(i => i.vendorId)), [invites])

  function showToast(msg: string, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const serviceOptions = useMemo(
    () => [...new Set(vendors.flatMap(v => parseSpecialties(v.specialties)))].sort(),
    [vendors],
  )
  const stateOptions = useMemo(
    () => [...new Set(vendors.map(v => v.state).filter(Boolean))].sort(),
    [vendors],
  )

  const filtered = vendors.filter(v => {
    if (search) {
      const hay = `${v.businessName} ${v.bio} ${v.user?.name ?? ''}`.toLowerCase()
      if (!hay.includes(search.toLowerCase())) return false
    }
    if (service !== 'all' && !parseSpecialties(v.specialties).includes(service)) return false
    if (state !== 'all' && v.state !== state) return false
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
    <div>
      {toast && (
        <div className={`fixed top-5 right-5 z-[80] px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium ${toast.type === 'error' ? 'bg-red-500 text-[#fff]' : 'bg-dark text-[#fff]'}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-7">
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-ink">Find Vendors</h1>
        <p className="text-ink-3 text-[14px] mt-1">Browse verified vendors and invite them to bid on your events.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors bg-white"
          />
        </div>
        <select value={service} onChange={e => setService(e.target.value)}
          className="w-[170px] shrink-0 px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-primary transition-colors">
          <option value="all">All services</option>
          {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={state} onChange={e => setState(e.target.value)}
          className="w-[150px] shrink-0 px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-primary transition-colors">
          <option value="all">All locations</option>
          {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-[24px] mb-3">🔍</p>
          <p className="font-display font-bold text-[18px] text-ink mb-1">
            {vendors.length === 0 ? 'No verified vendors yet' : 'No vendors match your filters'}
          </p>
          <p className="text-ink-3 text-[14px]">
            {vendors.length === 0 ? 'Check back soon as more vendors get verified.' : 'Try a different service or location.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(v => {
            const services = parseSpecialties(v.specialties)
            const invited = invitedVendorIds.has(v.userId)
            return (
              <div key={v.userId} className="bg-white border border-border rounded-xl p-5 flex flex-col">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-display font-semibold text-[16px] text-ink leading-tight">{v.businessName}</h3>
                  <BadgeCheck size={15} className="text-success shrink-0 mt-0.5" />
                  {invited && (
                    <span className="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full bg-success/10 text-[#13863a] text-[10px] font-semibold px-2 py-0.5">
                      <Check size={10} /> Invited
                    </span>
                  )}
                </div>
                {v.user?.name && (
                  <p className="text-[12px] text-ink-3 mb-1">Contact: {v.user.name}</p>
                )}
                {(v.city || v.state) && (
                  <p className="flex items-center gap-1.5 text-[12px] text-ink-3 mb-2">
                    <MapPin size={12} /> {[v.city, v.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {v.bio && <p className="text-[13px] text-ink-2 leading-relaxed mb-3 line-clamp-2">{v.bio}</p>}
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {services.slice(0, 4).map(s => (
                      <span key={s} className="rounded-md bg-canvas border border-border px-2 py-0.5 text-[11px] text-ink-2">{s}</span>
                    ))}
                    {services.length > 4 && <span className="text-[11px] text-ink-3 px-1 py-0.5">+{services.length - 4}</span>}
                  </div>
                )}
                <div className="mt-auto flex gap-2 pt-1">
                  <button onClick={() => setViewId(v.userId)}
                    className="flex-1 py-2 border border-border text-ink-2 text-[12px] font-medium rounded-lg hover:bg-canvas transition-colors">
                    View profile
                  </button>
                  <button onClick={() => setInviteVendor(v)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary text-[12px] font-medium rounded-lg hover:bg-primary/20 transition-colors">
                    <UserPlus size={13} /> Invite to bid
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewId && <VendorProfileModal userId={viewId} onClose={() => setViewId(null)} />}
      {inviteVendor && (
        <InviteToBidModal
          vendor={inviteVendor}
          plans={plans}
          invites={invites}
          onClose={() => setInviteVendor(null)}
          onSent={(planId, planCategoryId) =>
            setInvites(prev => [...prev, { vendorId: inviteVendor.userId, planId, planCategoryId }])
          }
          onResult={(msg, type) => { setInviteVendor(null); showToast(msg, type) }}
        />
      )}
    </div>
  )
}

// ── Invite-to-bid modal ──────────────────────────────────────────────────────
function InviteToBidModal({
  vendor, plans, invites, onClose, onSent, onResult,
}: {
  vendor: BrowseVendor
  plans: Plan[]
  invites: SentInvite[]
  onClose: () => void
  onSent: (planId: string, planCategoryId: string) => void
  onResult: (msg: string, type?: string) => void
}) {
  const [planId, setPlanId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sending, setSending] = useState(false)

  const vendorServices = parseSpecialties(vendor.specialties)
  // Slots (event + category) this vendor has already been invited to.
  const invitedSlots = useMemo(
    () => new Set(invites.filter(i => i.vendorId === vendor.userId).map(i => `${i.planId}:${i.planCategoryId}`)),
    [invites, vendor.userId],
  )
  const now = Date.now()
  // Only events that are open for bids and haven't started can be invited to.
  const invitable = plans.filter(p =>
    ['open', 'bidding'].includes(p.status as string) &&
    (p.dateFlexible || !p.startDate || new Date(p.startDate).getTime() > now),
  )
  const selectedPlan = invitable.find(p => p.id === planId)
  // Categories on the chosen event that this vendor actually offers.
  const matchingCats = (selectedPlan?.categories ?? []).filter(c => vendorServices.includes(c.name))
  const allInvited = matchingCats.length > 0 && matchingCats.every(c => invitedSlots.has(`${planId}:${c.id}`))

  async function send() {
    if (!planId || !categoryId) return
    setSending(true)
    try {
      const res = await fetch(`/api/vendors/${vendor.userId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, planCategoryId: categoryId }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) { onResult(data?.error ?? 'Could not send the invite', 'error'); return }
      onSent(planId, categoryId)
      onResult(`Invite sent to ${vendor.businessName}.`)
    } catch {
      onResult('Network error. Please try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl bg-white shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display text-[18px] font-bold text-ink">Invite to bid</h3>
          <button onClick={onClose} className="text-ink-3 hover:text-ink"><X size={18} /></button>
        </div>
        <p className="text-[13px] text-ink-3 mb-5">Invite <span className="font-medium text-ink">{vendor.businessName}</span> to bid on one of your events. They&apos;ll be notified and can submit their own price.</p>

        {invitable.length === 0 ? (
          <div className="rounded-lg border border-border bg-canvas px-4 py-3 text-[13px] text-ink-2">
            You have no events open for bids right now. Publish an event first, then invite vendors to it.
            <Link href="/organiser/plans" className="mt-2 block text-[12px] font-medium text-primary hover:underline">Go to My Events →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-ink-2 mb-1">Event</label>
              <select value={planId} onChange={e => { setPlanId(e.target.value); setCategoryId('') }}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-primary transition-colors">
                <option value="">Select an event…</option>
                {invitable.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {selectedPlan && (
              <div>
                <label className="block text-[12px] font-medium text-ink-2 mb-1">Service category</label>
                {matchingCats.length === 0 ? (
                  <p className="text-[12px] text-[#92660A] bg-warning/10 rounded-lg px-3 py-2">
                    This event doesn&apos;t need any of {vendor.businessName}&apos;s services.
                  </p>
                ) : allInvited ? (
                  <p className="text-[12px] text-[#13863a] bg-success/10 rounded-lg px-3 py-2">
                    You&apos;ve already invited {vendor.businessName} for every matching service on this event.
                  </p>
                ) : (
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-ink bg-white focus:outline-none focus:border-primary transition-colors">
                    <option value="">Select a category…</option>
                    {matchingCats.map(c => {
                      const already = invitedSlots.has(`${planId}:${c.id}`)
                      return (
                        <option key={c.id} value={c.id} disabled={already}>
                          {c.name}{already ? ' (already invited)' : ''}
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>
            )}

            <button onClick={send} disabled={sending || !planId || !categoryId}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-dark text-[13px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={15} /> {sending ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
