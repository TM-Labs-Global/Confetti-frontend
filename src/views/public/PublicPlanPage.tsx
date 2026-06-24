'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppLogo, EventTile } from '@/features/shared-ui'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDateRange } from '@/shared/utils/format'
import { budgetColor } from '@/shared/utils/palette'

interface PublicCategory { id: string; name: string; allocation: number }
interface PublicPlan {
  id: string
  name: string
  status: string
  startDate: string | null
  endDate: string | null
  dateFlexible: boolean
  state: string
  city: string
  totalBudget: number
  shareCode: string
  eventType?: { id: string; name: string }
  categories: PublicCategory[]
  organiser?: { name: string }
}

export default function PublicPlanPage() {
  const { code } = useParams()
  const [plan, setPlan] = useState<PublicPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/plans/share/${code}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => setPlan(data?.plan ?? null))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas p-4 text-center">
        <p className="font-display text-[20px] font-bold text-ink">This event isn't available</p>
        <p className="text-[14px] text-ink-3">The link may be incorrect, or the event is no longer open for bids.</p>
        <Link href="/" className="mt-2 text-[13px] font-medium text-primary hover:underline">Go to Confette</Link>
      </div>
    )
  }

  const meta = plan.eventType?.id && plan.eventType.id in EVENT_META
    ? EVENT_META[plan.eventType.id as keyof typeof EVENT_META]
    : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
  const dateLabel = fmtDateRange(plan.startDate, plan.endDate, plan.dateFlexible)
  const location  = [plan.city, plan.state].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[760px] items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Confette home"><AppLogo size={28} /></Link>
          <Link href="/signup?role=vendor" className="rounded-lg bg-warning px-4 py-2 text-[13px] font-semibold text-dark transition-colors hover:bg-warning/90">
            Bid as a vendor
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-5 py-10">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">Shared event</p>

        <div className="mb-4 rounded-2xl border border-border bg-white p-6">
          <div className="flex items-start gap-4">
            <EventTile type={plan.eventType?.id || ''} bg={meta.bg} color={meta.color} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">{plan.eventType?.name}</p>
              <h1 className="font-display text-[24px] font-bold leading-tight text-ink">{plan.name}</h1>
              <p className="mt-1 text-[13px] text-ink-3">{dateLabel} · {location || 'Location to be confirmed'}</p>
              {plan.organiser?.name && <p className="mt-1 text-[12px] text-ink-3">Organised by {plan.organiser.name}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="mb-0.5 text-[11px] text-ink-3">Total budget</p>
              <p className="font-display text-[24px] font-bold text-ink">{fmtNaira(plan.totalBudget)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Services & budget</p>
          <div className="space-y-3.5">
            {plan.categories.map((cat, i) => {
              const pct = plan.totalBudget > 0 ? (cat.allocation / plan.totalBudget) * 100 : 0
              return (
                <div key={cat.id}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="text-ink-2">{cat.name}</span>
                    <span className="font-medium tabular-nums text-ink">{fmtNaira(cat.allocation)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full border border-border bg-canvas">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: budgetColor(i) }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/[0.06] p-6 text-center">
          <p className="font-display text-[16px] font-semibold text-ink">Are you a vendor?</p>
          <p className="mx-auto mt-1 max-w-[420px] text-[13px] text-ink-2">
            Create a free Confette account to submit a bid on any of these services and get paid through secure escrow.
          </p>
          <Link href="/signup?role=vendor" className="mt-4 inline-flex rounded-xl bg-warning px-6 py-2.5 text-[13px] font-semibold text-dark transition-colors hover:bg-warning/90">
            Sign up to bid
          </Link>
        </div>
      </main>
    </div>
  )
}
