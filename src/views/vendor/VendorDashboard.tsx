'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '@/shared/utils/format'
import { EventTile } from '@/features/shared-ui'
import { VendorBid } from '@/features/vendor/types/vendor.types'
import { Plan } from '@/features/organiser/types/plan.types'

const BID_STATUS_META = {
  pending:  { label: 'Pending',  style: 'bg-warning/20 text-[#92660A]' },
  accepted: { label: 'Accepted', style: 'bg-success/15 text-[#166534]' },
  rejected: { label: 'Rejected', style: 'bg-red-100 text-red-600' },
}

interface StatCardProps {
  label: string
  value: number | string
  accent?: string
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <p className="text-[12px] text-ink-3 font-medium mb-1">{label}</p>
      <p className={`font-display font-bold text-[28px] leading-none ${accent ?? 'text-ink'}`}>{value}</p>
    </div>
  )
}

export default function VendorDashboard() {
  const { user } = useAuth()
  const [bids, setBids]         = useState<VendorBid[]>([])
  const [plans, setPlans]       = useState<Plan[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/bids').then(r => r.ok ? r.json() : { bids: [] }),
      fetch('/api/marketplace').then(r => r.ok ? r.json() : { plans: [] }),
    ]).then(([bidsData, plansData]) => {
      setBids(bidsData.bids ?? [])
      setPlans(plansData.plans ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const activeBids   = bids.filter(b => b.status === 'pending').length
  const acceptedBids = bids.filter(b => b.status === 'accepted').length
  const recentBids   = [...bids].slice(0, 3)

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
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-1">Vendor Portal</p>
        <h1 className="font-display font-bold text-[28px] text-ink leading-tight">
          {user?.name?.split(' ')[0] ?? 'Hey'}'s dashboard
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total bids"    value={bids.length} />
        <StatCard label="Active bids"   value={activeBids}    accent="text-warning" />
        <StatCard label="Accepted"      value={acceptedBids}  accent="text-success" />
        <StatCard label="Open plans"    value={plans.length} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Browse Plans',  desc: 'Find events to bid on', href: '/vendor/marketplace', emoji: '🔍' },
          { label: 'My Bids',      desc: 'Track your submissions', href: '/vendor/bids',       emoji: '📋' },
          { label: 'Win Rate',      desc: `${acceptedBids} of ${bids.length} bids accepted`, href: '/vendor/bids', emoji: '🏆' },
        ].map(({ label, desc, href, emoji }) => (
          <Link key={href + label} href={href}
            className="bg-white border border-border rounded-xl p-5 flex items-start gap-3 hover:border-warning/40 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <p className="font-medium text-ink text-[14px] group-hover:text-warning transition-colors">{label}</p>
              <p className="text-ink-3 text-[12px] mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {bids.length > 0 && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">Recent bids</p>
            <Link href="/vendor/bids" className="text-[12px] text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentBids.map(bid => {
              const bs   = BID_STATUS_META[bid.status] ?? BID_STATUS_META.pending
              const meta = (bid.plan?.eventTypeId && bid.plan.eventTypeId in EVENT_META)
                ? EVENT_META[bid.plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
              return (
                <Link key={bid.id} href={`/vendor/marketplace/${bid.planId}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                >
                  <EventTile type={bid.plan?.eventTypeId || ''} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-[14px] truncate">{bid.plan?.name}</p>
                    <p className="text-ink-3 text-[12px] mt-0.5">{bid.planCategory?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-ink text-[14px] tabular-nums">{fmtNaira(bid.amount)}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${bs.style}`}>{bs.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div className="bg-white border border-border rounded-xl overflow-hidden mt-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">Open plans near you</p>
            <Link href="/vendor/marketplace" className="text-[12px] text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {plans.slice(0, 3).map(plan => {
              const meta = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
                ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
                : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
              return (
                <Link key={plan.id} href={`/vendor/marketplace/${plan.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                >
                  <EventTile type={plan.eventTypeId} bg={meta.bg} color={meta.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-[14px] truncate">{plan.name}</p>
                    <p className="text-ink-3 text-[12px] mt-0.5">{plan.city}, {plan.state}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-ink text-[13px] tabular-nums">{fmtNaira(plan.totalBudget)}</p>
                    <p className="text-ink-3 text-[11px] mt-0.5">{plan.bidCount ?? 0} bids</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
