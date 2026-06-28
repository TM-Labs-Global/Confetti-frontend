'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Users, ArrowRight } from 'lucide-react'
import { EVENT_META } from '@/data/mockCategories'
import { fmtNaira, fmtDateRange, fmtGuests } from '@/shared/utils/format'

interface FeaturedEvent {
  id: string
  name: string
  state: string
  city: string
  guestCount: number | null
  totalBudget: number
  startDate: string | null
  endDate: string | null
  dateFlexible: boolean
  shareCode: string
  eventType?: { id: string; name: string }
  categoryCount: number
}

export function FeaturedEvents() {
  const [events, setEvents] = useState<FeaturedEvent[] | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/plans/featured')
      .then(r => (r.ok ? r.json() : { plans: [] }))
      .then(d => { if (active) setEvents(d.plans ?? []) })
      .catch(() => { if (active) setEvents([]) })
    return () => { active = false }
  }, [])

  // Hide the section entirely until at least one live event is open for bids.
  if (!events || events.length === 0) return null

  return (
    <section id="live-events" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-aurora absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/12 blur-[130px]" />
        <div className="animate-aurora absolute left-0 bottom-0 h-72 w-72 rounded-full bg-success/10 blur-[130px]" style={{ animationDelay: '6s' }} />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-primary">Open for bids</p>
          <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
            Events happening now
          </h2>
          <p className="mt-4 text-[16px] text-[var(--ld-text-2)]">
            Real events on Confette looking for vendors right now. Sign up to bid, or plan your own.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(ev => {
            const meta = ev.eventType?.id && ev.eventType.id in EVENT_META
              ? EVENT_META[ev.eventType.id as keyof typeof EVENT_META]
              : { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
            const location = [ev.city, ev.state].filter(Boolean).join(', ')
            const dateLabel = fmtDateRange(ev.startDate, ev.endDate, ev.dateFlexible)
            const guests = fmtGuests(ev.guestCount)
            return (
              <Link
                key={ev.id}
                href={`/p/${ev.shareCode}`}
                className="group flex flex-col rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass)] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[24px] transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `color-mix(in srgb, ${meta.color} 18%, transparent)` }}
                    aria-hidden
                  >
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ld-text-muted)]">{ev.eventType?.name}</p>
                    <h3 className="truncate font-display text-[16px] font-semibold text-[var(--ld-text)]">{ev.name}</h3>
                  </div>
                </div>

                <p className="mt-3 text-[13px] text-[var(--ld-text-2)]">{dateLabel}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--ld-text-2)]">
                  {location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {location}</span>}
                  {guests && <span className="inline-flex items-center gap-1"><Users size={12} /> {guests}</span>}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--ld-border)] pt-3">
                  <span className="text-[12px] text-[var(--ld-text-muted)]">{ev.categoryCount} service{ev.categoryCount !== 1 ? 's' : ''}</span>
                  <span className="font-mono text-[15px] font-medium tabular-nums text-[var(--ld-text)]">{fmtNaira(ev.totalBudget)}</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup?role=vendor"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-warning px-7 py-3.5 text-[15px] font-semibold text-dark transition-colors hover:bg-warning/90 sm:w-auto"
          >
            Bid on events
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/signup?role=organiser"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-glass)] px-7 py-3.5 text-[15px] font-semibold text-[var(--ld-text)] backdrop-blur transition-colors hover:bg-[var(--ld-glass-strong)] sm:w-auto"
          >
            Plan your event
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedEvents
