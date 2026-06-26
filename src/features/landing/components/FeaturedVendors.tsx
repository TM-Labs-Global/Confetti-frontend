'use client'
import Link from 'next/link'
import { BadgeCheck, MapPin, ArrowRight } from 'lucide-react'
import { useFeaturedVendors } from './LandingShell'

// Maps a vendor's service to an emoji for its avatar. Keys are matched as
// substrings of the (lowercased) service name, so "Make-up Artist" still hits
// "makeup". Falls back to a party popper for anything unrecognised.
const SERVICE_EMOJI: Record<string, string> = {
  catering: '🍲', food: '🍲', drink: '🥂', bar: '🥂',
  venue: '🏛️', hall: '🏛️', space: '🏛️',
  decor: '🎀', styling: '🎀', flora: '🌸',
  photo: '📸', video: '🎥', film: '🎥',
  dj: '🎧', sound: '🎧', music: '🎧', entertain: '🎧',
  makeup: '💄', 'make-up': '💄', beauty: '💄', hair: '💇',
  mc: '🎤', host: '🎤', compere: '🎤',
  cake: '🎂', pastry: '🎂', dessert: '🎂', confection: '🎂',
  'aso-ebi': '👗', fashion: '👗', attire: '👗', outfit: '👗',
  power: '⚡', generator: '⚡',
  logistic: '🚐', transport: '🚐',
  security: '🛡️', usher: '🙋',
  rental: '🪑', furniture: '🪑',
  invitation: '💌', stationery: '💌', print: '🖨️',
}

const TINTS = ['var(--primary)', 'var(--warning)', 'var(--success)', '#FF6B9D']

function emojiFor(specialties: string[]): string {
  const s = (specialties[0] ?? '').toLowerCase()
  for (const key in SERVICE_EMOJI) if (s.includes(key)) return SERVICE_EMOJI[key]
  return '🎉'
}

function serviceLabel(specialties: string[]): string {
  if (specialties.length === 0) return 'Event services'
  if (specialties.length === 1) return specialties[0]
  return `${specialties[0]} +${specialties.length - 1} more`
}

export function FeaturedVendors() {
  const { vendors } = useFeaturedVendors()

  // Hide the section entirely until at least one verified vendor exists.
  if (!vendors || vendors.length === 0) return null

  return (
    <section id="vendors" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-aurora absolute left-0 top-1/3 h-80 w-80 rounded-full bg-warning/12 blur-[130px]" />
        <div className="animate-aurora absolute right-0 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-[130px]" style={{ animationDelay: '6s' }} />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-warning">Meet the vendors</p>
          <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
            Talented vendors, ready to bid
          </h2>
          <p className="mt-4 text-[16px] text-[var(--ld-text-2)]">
            From caterers to decorators, a growing community of verified pros across Nigeria competes to bring your event to life.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v, i) => {
            const tint = TINTS[i % TINTS.length]
            const location = [v.city, v.state].filter(Boolean).join(', ')
            return (
              <div
                key={i}
                className="group rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass)] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[26px] transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `color-mix(in srgb, ${tint} 18%, transparent)` }}
                    aria-hidden
                  >
                    {emojiFor(v.specialties)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-display text-[16px] font-semibold text-[var(--ld-text)]">{v.businessName}</h3>
                      <BadgeCheck size={15} className="shrink-0 text-success" />
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-[var(--ld-text-muted)]">{serviceLabel(v.specialties)}</p>
                    {location && (
                      <p className="mt-2 inline-flex items-center gap-1 text-[12.5px] text-[var(--ld-text-2)]">
                        <MapPin size={12} /> {location}
                      </p>
                    )}
                  </div>
                </div>
                {v.bio && (
                  <p className="mt-4 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--ld-text-2)]">{v.bio}</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup?role=organiser"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-dark transition-colors hover:bg-primary/90 sm:w-auto"
          >
            Find vendors for your event
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/signup?role=vendor"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-glass)] px-7 py-3.5 text-[15px] font-semibold text-[var(--ld-text)] backdrop-blur transition-colors hover:bg-[var(--ld-glass-strong)] sm:w-auto"
          >
            Join as a vendor
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedVendors

// Footer "Vendors" link — only rendered when the showcase section is shown, so
// the anchor never dangles to a hidden section.
export function VendorsFooterLink() {
  const { vendors } = useFeaturedVendors()
  if (!vendors || vendors.length === 0) return null
  return (
    <li>
      <a href="#vendors" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">Vendors</a>
    </li>
  )
}
