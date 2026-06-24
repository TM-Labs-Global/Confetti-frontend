'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDate } from '@/shared/utils/format'
import { EventTile } from '@/features/shared-ui'
import { Plan } from '@/features/organiser/types/plan.types'

const STATUS_META = {
  draft:        { label: 'Draft',       style: 'bg-[#F3F4F6] text-[#374151]' },
  open:         { label: 'Open',        style: 'bg-primary/10 text-primary' },
  bidding:      { label: 'Bidding',     style: 'bg-warning/20 text-[#92660A]' },
  'in-progress':{ label: 'In Progress', style: 'bg-success/15 text-[#166634]' },
  completed:    { label: 'Completed',   style: 'bg-[#F3F4F6] text-[#374151]' },
  disputed:     { label: 'Disputed',    style: 'bg-red-100 text-red-600' },
}

interface StatCardProps {
  label: string
  value: number | string
  accent?: string
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-black/20">
      <p className="text-[12px] font-medium uppercase tracking-[0.07em] text-dark-muted mb-2">{label}</p>
      <p className={`font-display font-bold text-[28px] leading-none ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [plans, setPlans]         = useState<Plan[]>([])
  const [vendors, setVendors]     = useState<Array<{ vendorProfile: { status: string } | null }>>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/plans').then(r => r.ok ? r.json() : { plans: [] }),
      fetch('/api/vendors').then(r => r.ok ? r.json() : { vendors: [] }),
    ]).then(([plansData, vendorsData]) => {
      setPlans(plansData.plans ?? [])
      setVendors(vendorsData.vendors ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const openPlans      = plans.filter(p => p.status !== 'draft').length
  const totalBids      = plans.reduce((s, p) => s + (p.bidCount ?? 0), 0)
  const pendingVendors = vendors.filter(v => v.vendorProfile?.status === 'pending').length
  const flaggedPlans   = plans.filter(p => p.status === 'disputed').length
  const recentPlans    = [...plans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4)

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={plans.length}       />
        <StatCard label="Live Events"  value={openPlans}          accent="text-primary" />
        <StatCard label="Total Bids"   value={totalBids}          accent="text-warning" />
        <StatCard label="Vendors"      value={vendors.length}     />
      </div>

      {/* Needs attention — the two queues an admin actually acts on. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link href="/admin/vendors"
          className={`rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 group ${pendingVendors > 0 ? 'border-warning/40 bg-warning/[0.07] hover:bg-warning/10' : 'border-dark-border bg-dark-surface hover:border-primary/40'}`}>
          <p className="text-[12px] font-medium uppercase tracking-[0.07em] text-dark-muted mb-2">Vendors awaiting review</p>
          <div className="flex items-end justify-between">
            <p className={`font-display font-bold text-[28px] leading-none ${pendingVendors > 0 ? 'text-warning' : 'text-white'}`}>{pendingVendors}</p>
            <span className="inline-flex items-center gap-1 text-[12px] text-primary">{pendingVendors > 0 ? 'Review now' : 'All clear'}{pendingVendors > 0 && <span className="transition-transform group-hover:translate-x-0.5">→</span>}</span>
          </div>
        </Link>
        <Link href="/admin/plans"
          className={`rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 group ${flaggedPlans > 0 ? 'border-red-500/40 bg-red-500/[0.07] hover:bg-red-500/10' : 'border-dark-border bg-dark-surface hover:border-primary/40'}`}>
          <p className="text-[12px] font-medium uppercase tracking-[0.07em] text-dark-muted mb-2">Flagged events</p>
          <div className="flex items-end justify-between">
            <p className={`font-display font-bold text-[28px] leading-none ${flaggedPlans > 0 ? 'text-red-400' : 'text-white'}`}>{flaggedPlans}</p>
            <span className="inline-flex items-center gap-1 text-[12px] text-primary">{flaggedPlans > 0 ? 'Resolve' : 'None flagged'}{flaggedPlans > 0 && <span className="transition-transform group-hover:translate-x-0.5">→</span>}</span>
          </div>
        </Link>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <p className="font-display font-semibold text-[14px] text-white">Recent Events</p>
          <Link href="/admin/plans" className="text-[12px] text-primary hover:text-primary/70 transition-colors">View all</Link>
        </div>
        <div className="divide-y divide-dark-border">
          {recentPlans.length === 0 ? (
            <p className="text-dark-muted text-[13px] text-center py-10">No events yet</p>
          ) : recentPlans.map(plan => {
            const meta = (plan.eventTypeId && plan.eventTypeId in EVENT_META)
              ? EVENT_META[plan.eventTypeId as keyof typeof EVENT_META]
              : { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
            const st   = STATUS_META[plan.status as keyof typeof STATUS_META] ?? STATUS_META.draft
            return (
              <Link key={plan.id} href={`/admin/plans/${plan.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors group"
              >
                <EventTile type={plan.eventTypeId || ''} bg={meta.bg} color={meta.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate group-hover:text-primary transition-colors">{plan.name}</p>
                  <p className="text-dark-muted text-[11px] mt-0.5">{plan.city}, {plan.state}</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                  <p className="text-[13px] font-semibold text-white tabular-nums">{fmtNaira(plan.totalBudget)}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.style}`}>{st.label}</span>
                  <p className="hidden sm:block text-[12px] text-primary">{plan.bidCount ?? 0} bids</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
