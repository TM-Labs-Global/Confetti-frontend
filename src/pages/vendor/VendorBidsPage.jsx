'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '../../utils/format'

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166534]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
}

const TABS = [
  { id: 'all',      label: 'All' },
  { id: 'pending',  label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
]

export default function VendorBidsPage() {
  const [bids, setBids]       = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all')

  useEffect(() => {
    fetch('/api/bids')
      .then(r => r.ok ? r.json() : { bids: [] })
      .then(data => setBids(data.bids ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tab === 'all' ? bids : bids.filter(b => b.status === tab)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-1">Vendor</p>
        <h1 className="font-display font-bold text-[28px] text-ink">My Bids</h1>
      </div>

      <div className="flex gap-1 mb-5">
        {TABS.map(t => {
          const count = t.id === 'all' ? bids.length : bids.filter(b => b.status === t.id).length
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                tab === t.id ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink hover:bg-canvas'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[11px] ${tab === t.id ? 'text-white/70' : 'text-ink-3'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-[24px] mb-3">📋</p>
          <p className="font-display font-bold text-[18px] text-ink mb-1">No bids yet</p>
          <p className="text-ink-3 text-[14px] mb-5">Browse open plans and submit your first bid.</p>
          <Link href="/vendor/marketplace"
            className="inline-flex px-6 py-2.5 bg-warning text-dark text-[13px] font-semibold rounded-lg hover:bg-warning/90 transition-colors"
          >
            Browse Plans
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map(bid => {
              const bs   = BID_STATUS_META[bid.status] ?? BID_STATUS_META.pending
              const meta = EVENT_META[bid.plan?.eventTypeId] ?? { emoji: '🎉', bg: '#F5F5F5' }
              return (
                <Link key={bid.id} href={`/vendor/marketplace/${bid.planId}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: meta.bg }}>
                    {meta.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-[14px] truncate">{bid.plan?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-ink-3 text-[12px]">{bid.planCategory?.name}</p>
                      {bid.isCounterBid && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-warning/20 text-[#92660A] rounded-full font-medium">Counter bid</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-ink text-[14px] tabular-nums">{fmtNaira(bid.amount)}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${bs.style}`}>{bs.label}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3 shrink-0">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
