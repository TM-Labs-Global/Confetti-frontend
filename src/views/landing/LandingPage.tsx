import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles, ClipboardList, Gavel, ShieldCheck, ArrowRight,
  PartyPopper, Lock, BadgeCheck, Wallet, Star,
  CalendarDays, Store, Quote, Check, Plus,
  CreditCard, MessageSquare, Smartphone,
  Mail, Phone, MapPin,
} from 'lucide-react'
import { LandingShell } from '@/features/landing/components/LandingShell'
import { LandingNav } from '@/features/landing/components/LandingNav'
import { HeroCards } from '@/features/landing/components/HeroCards'
import { SocialLinks } from '@/features/landing/components/SocialLinks'
import { FeaturedVendors, VendorsFooterLink } from '@/features/landing/components/FeaturedVendors'
import { AppLogo, ConfettiBurst } from '@/features/shared-ui'

// Unsplash image helper (host allow-listed in next.config.ts).
const ux = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`

const EVENTS = [
  { emoji: '💍', name: 'Weddings', img: ux('1519741497674-611481863552') },
  { emoji: '🎂', name: 'Birthdays', img: ux('1556125574-d7f27ec36a06') },
  { emoji: '🏢', name: 'Corporate', img: ux('1543269865-cbf427effbad') },
  { emoji: '🍼', name: 'Baby Showers', img: ux('1530103862676-de8c9debad1d') },
  { emoji: '🎓', name: 'Graduations', img: ux('1492684223066-81342ee5ff30') },
  { emoji: '💞', name: 'Anniversaries', img: ux('1519225421980-715cb0215aed') },
]

// About-section hero image (real joyful wedding-exit moment).
const ABOUT_IMG = ux('1583939003579-730e3918a45a', 1000)

// Vendor service categories - shown in the hero marquee (distinct from the
// event-type grid below) to convey the breadth of vendors on the platform.
const SERVICES = [
  { emoji: '🍲', name: 'Catering' },
  { emoji: '🏛️', name: 'Venue' },
  { emoji: '🎀', name: 'Décor' },
  { emoji: '📸', name: 'Photography' },
  { emoji: '🎥', name: 'Videography' },
  { emoji: '🎧', name: 'DJ & Sound' },
  { emoji: '💄', name: 'Makeup' },
  { emoji: '🎤', name: 'MC / Host' },
  { emoji: '🎂', name: 'Cake' },
  { emoji: '👗', name: 'Aso-ebi' },
  { emoji: '⚡', name: 'Power' },
  { emoji: '🚐', name: 'Logistics' },
]

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Plan & set your budget',
    body: 'Pick your event type, split your budget across categories like catering, venue and décor, then publish in minutes.',
    tint: 'var(--primary)',
  },
  {
    icon: Gavel,
    title: 'Vendors bid for you',
    body: 'Verified vendors across Nigeria compete with their best offers. Compare pitches and prices, then pick your favourites.',
    tint: 'var(--warning)',
  },
  {
    icon: ShieldCheck,
    title: 'Escrow keeps it safe',
    body: "Funds are held in escrow and released as milestones are met, so nobody gets burned. Everyone stays protected.",
    tint: 'var(--success)',
  },
]

const TRUST = [
  { icon: Lock, title: 'Funds held in escrow', body: 'Your money sits safely until the work is done and signed off.' },
  { icon: BadgeCheck, title: 'Verified vendors', body: 'Every vendor is vetted before they can bid on your event.' },
  { icon: Wallet, title: 'Milestone releases', body: 'Pay out in stages as each part of your event comes together.' },
]

const PERSONAS = [
  {
    icon: CalendarDays,
    tint: 'var(--primary)',
    eyebrow: 'For organisers',
    title: 'Plan it once. Vendors come to you.',
    perks: [
      'Set your budget and split it across categories',
      'Receive competing bids from vetted vendors',
      'Compare pitches, accept the best, pay safely',
    ],
    cta: { label: 'Plan an event', href: '/signup?role=organiser' },
  },
  {
    icon: Store,
    tint: 'var(--warning)',
    eyebrow: 'For vendors',
    title: 'Win more gigs. Get paid on time.',
    perks: [
      'Browse live events looking for your service',
      'Bid with your price and your best pitch',
      'Get paid through escrow, with no chasing clients',
    ],
    cta: { label: 'Join as a vendor', href: '/signup?role=vendor' },
  },
]

const TESTIMONIALS = [
  {
    quote: 'I planned my whole wedding from my phone. Vendors bid, I picked, escrow handled the rest. Stress-free owambe.',
    name: 'Adaeze O.',
    role: 'Bride, Lagos',
    tint: 'var(--primary)',
  },
  {
    quote: 'Confette keeps my calendar full. I bid on events in my area and the escrow means I always get paid.',
    name: 'Chukwuemeka B.',
    role: 'Caterer, Abuja',
    tint: 'var(--warning)',
  },
  {
    quote: 'No more paying 100% upfront and hoping. Milestone releases gave me real peace of mind.',
    name: 'Tunde A.',
    role: 'Corporate organiser, PH',
    tint: 'var(--success)',
  },
]

const ROADMAP = [
  { icon: CreditCard, tint: 'var(--primary)', title: 'Real payments', body: 'Fund escrow and pay vendors right inside Confette.' },
  { icon: MessageSquare, tint: 'var(--warning)', title: 'Reviews & ratings', body: 'See and leave honest reviews after every event.' },
  { icon: BadgeCheck, tint: 'var(--success)', title: 'Vendor verification', body: 'Trust badges so you know exactly who you’re hiring.' },
  { icon: Smartphone, tint: '#FF6B9D', title: 'Mobile app', body: 'Plan and bid on the go, straight from your phone.' },
]

const FAQS = [
  { q: 'How much does Confette cost?', a: 'Creating an account and planning your event is free. You only commit money when you accept a vendor and fund escrow.' },
  { q: 'How does escrow protect me?', a: 'Your payment is held securely and released to the vendor in stages as each milestone is completed, so neither side is left exposed.' },
  { q: 'Are vendors verified?', a: 'Yes. Every vendor is vetted before they can bid, so you only compare offers from trusted suppliers.' },
  { q: 'What kinds of events can I plan?', a: 'Weddings, birthdays, corporate events, baby showers, graduations, anniversaries and more. Each comes with a tailored budget breakdown.' },
]

/* Reusable bits ───────────────────────────────────────── */

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em]" style={{ color }}>{children}</p>
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

/* Page ─────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <LandingShell>
      <LandingNav />

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden pt-36 pb-28 sm:pt-44 sm:pb-36">
        {/* Aurora + grid backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-aurora absolute -left-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-primary/30 blur-[140px]" />
          <div className="animate-aurora absolute -right-24 top-10 h-[30rem] w-[30rem] rounded-full bg-[#FF6B9D]/25 blur-[150px]" style={{ animationDelay: '4s' }} />
          <div className="animate-aurora absolute left-1/3 top-1/2 h-[28rem] w-[28rem] rounded-full bg-warning/20 blur-[150px]" style={{ animationDelay: '8s' }} />
          <div className="animate-aurora absolute right-1/4 bottom-0 h-[26rem] w-[26rem] rounded-full bg-success/20 blur-[150px]" style={{ animationDelay: '11s' }} />
        </div>
        <div aria-hidden className="ld-grid absolute inset-0" />

        <ConfettiBurst />
        <HeroCards />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-[var(--ld-border)] bg-[var(--ld-glass)] px-4 py-1.5 text-[13px] font-medium text-[var(--ld-text)] backdrop-blur">
            <Sparkles size={14} className="text-warning" />
            Nigeria&apos;s event planning marketplace
          </span>

          <h1 className="animate-rise mt-7 font-display text-[46px] font-bold leading-[1.04] tracking-[-0.025em] text-[var(--ld-text)] sm:text-[68px]" style={{ animationDelay: '0.05s' }}>
            Throw the event
            <br className="hidden sm:block" />{' '}
            of the{' '}
            <span className="text-shine bg-gradient-to-r from-primary via-[#7CE0FF] to-success bg-clip-text text-transparent">
              year
            </span>
            .
          </h1>

          <p className="animate-rise mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[var(--ld-text-2)] sm:text-[19px]" style={{ animationDelay: '0.1s' }}>
            Set your budget, let trusted vendors bid to bring it to life, and keep every naira
            protected by escrow. From owambe to corporate, Confette makes it effortless.
          </p>

          <div className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '0.15s' }}>
            <Link
              href="/signup?role=organiser"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-dark shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 sm:w-auto"
            >
              <PartyPopper size={18} />
              Plan an event
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup?role=vendor"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-glass)] px-7 py-3.5 text-[15px] font-semibold text-[var(--ld-text)] backdrop-blur transition-colors hover:bg-[var(--ld-glass-strong)] sm:w-auto"
            >
              Join as a vendor
            </Link>
          </div>

          <div className="animate-rise mx-auto mt-12 flex max-w-lg items-center justify-center gap-10 sm:gap-14" style={{ animationDelay: '0.2s' }}>
            {[['2,400+', 'Events planned'], ['800+', 'Verified vendors'], ['₦2.5B+', 'Secured in escrow']].map(([v, l], i) => (
              <div key={l} className="flex items-center gap-10 sm:gap-14">
                {i > 0 && <div className="h-10 w-px bg-[var(--ld-border)]" />}
                <div className="flex flex-col">
                  <span className="font-mono text-[22px] font-medium text-[var(--ld-text)] tabular-nums">{v}</span>
                  <span className="text-[12.5px] text-[var(--ld-text-muted)]">{l}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor-services marquee (breadth of vendors - distinct from the event grid) */}
        <div className="relative z-10 mt-16">
          <p className="mb-4 text-center text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--ld-text-muted)]">
            Vendors for every part of your day
          </p>
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
            <div className="animate-marquee flex w-max gap-3">
              {[...SERVICES, ...SERVICES].map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--ld-border)] bg-[var(--ld-glass)] px-4 py-2 text-[14px] font-medium text-[var(--ld-text-2)] backdrop-blur"
                >
                  <span className="text-[16px]" aria-hidden>{s.emoji}</span>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── About ───────────────── */}
      <section id="about" className="relative overflow-hidden border-t border-[var(--ld-border)] py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-aurora absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <SectionLabel color="var(--primary)">What is Confette?</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-tight tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              The easiest way to plan an event in Nigeria
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[var(--ld-text-2)]">
              Confette brings planning, budgeting and trusted vendors into one place. Tell us about your
              event and set your budget, then verified vendors bid to bring it to life. Every payment is
              held in escrow, so you only pay for work that actually gets delivered. From weddings and
              birthdays to corporate galas, Confette takes the wahala out of celebrating.
            </p>

            <div className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                'Plan and budget in minutes',
                'Vendors bid to win your job',
                'Escrow protects every naira',
                'Built for Nigerian celebrations',
              ].map(point => (
                <div key={point} className="flex items-center gap-2.5 text-[14.5px] text-[var(--ld-text-2)]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {point}
                </div>
              ))}
            </div>

            <Link
              href="#how-it-works"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90"
            >
              See how it works
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[var(--ld-border)] shadow-2xl">
            <Image
              src={ABOUT_IMG}
              alt="Guests celebrating a wedding with confetti"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ───────────────── Events showcase ───────────────── */}
      <section id="events" className="border-y border-[var(--ld-border)] bg-[var(--ld-bg-2)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel color="var(--primary)">For every celebration</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              Whatever you&apos;re throwing, we&apos;ve got it
            </h2>
            <p className="mt-4 text-[16px] text-[var(--ld-text-2)]">
              Pick your event type and we&apos;ll suggest the right budget breakdown and the vendors to match.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {EVENTS.map(ev => (
              <div
                key={ev.name}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--ld-border)]"
              >
                <Image
                  src={ev.img}
                  alt={`${ev.name} on Confette`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 380px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
                  <span className="text-[20px]" aria-hidden>{ev.emoji}</span>
                  <span className="font-display text-[16px] font-semibold text-white drop-shadow">{ev.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Vendors showcase (live; hides when no verified vendors) ───────────────── */}
      <FeaturedVendors />

      {/* ───────────────── How it works ───────────────── */}
      <section id="how-it-works" className="relative overflow-hidden py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-aurora absolute left-1/4 top-0 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel color="var(--warning)">How it works</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              From idea to owambe in three steps
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <GlassCard key={step.title} className="relative p-7">
                <span className="font-mono text-[13px] font-medium text-[var(--ld-text-muted)]">0{i + 1}</span>
                <span
                  className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `color-mix(in srgb, ${step.tint} 18%, transparent)`, color: step.tint }}
                >
                  <step.icon size={24} strokeWidth={1.9} />
                </span>
                <h3 className="mt-5 font-display text-[19px] font-semibold text-[var(--ld-text)]">{step.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--ld-text-2)]">{step.body}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Two-sided ───────────────── */}
      <section className="border-y border-[var(--ld-border)] bg-[var(--ld-bg-2)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel color="var(--primary)">Two sides, one event</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              Whether you&apos;re throwing it or supplying it
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PERSONAS.map(p => (
              <GlassCard key={p.eyebrow} className="flex flex-col p-8 transition-all hover:-translate-y-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${p.tint} 18%, transparent)`, color: p.tint }}>
                  <p.icon size={24} strokeWidth={1.9} />
                </span>
                <p className="mt-5 font-mono text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: p.tint }}>{p.eyebrow}</p>
                <h3 className="mt-2 font-display text-[22px] font-bold text-[var(--ld-text)]">{p.title}</h3>
                <ul className="mt-5 flex-1 space-y-3">
                  {p.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-2.5 text-[14.5px] text-[var(--ld-text-2)]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.cta.href}
                  className="group mt-7 inline-flex items-center gap-2 self-start rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90"
                >
                  {p.cta.label}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Escrow / trust ───────────────── */}
      <section id="escrow" className="relative overflow-hidden py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-aurora absolute right-0 top-1/4 h-96 w-96 rounded-full bg-success/12 blur-[140px]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <SectionLabel color="var(--success)">Protected by escrow</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-tight tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              Your money is safe until the job is done
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[var(--ld-text-2)]">
              No more paying upfront and praying. Confette will lock funds in escrow and release them
              stage by stage as your vendor delivers, protecting organisers and vendors alike.
            </p>

            <div className="mt-8 space-y-4">
              {TRUST.map(item => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                    <item.icon size={20} strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="font-display text-[15.5px] font-semibold text-[var(--ld-text)]">{item.title}</p>
                    <p className="text-[14px] text-[var(--ld-text-2)]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow card */}
          <div className="relative">
            <GlassCard className="animate-float p-6 shadow-2xl" >
              <div className="flex items-center justify-between">
                <span className="font-display text-[15px] font-semibold text-[var(--ld-text)]">Escrow status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-[12px] font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Funded
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-card)] p-4">
                <p className="text-[12.5px] text-[var(--ld-text-muted)]">Total held</p>
                <p className="font-mono text-[28px] font-medium text-[var(--ld-text)] tabular-nums">₦1,350,000</p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: 'Bid accepted', done: true },
                  { label: 'Contract signed', done: true },
                  { label: 'Escrow funded', done: true },
                  { label: 'Work in progress', done: false },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${s.done ? 'bg-success text-dark' : 'border border-[var(--ld-border)] text-[var(--ld-text-muted)]'}`}>
                      {s.done ? <BadgeCheck size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-[var(--ld-text-muted)]" />}
                    </span>
                    <span className={`text-[14px] ${s.done ? 'text-[var(--ld-text)]' : 'text-[var(--ld-text-muted)]'}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ───────────────── Testimonials ───────────────── */}
      <section className="border-y border-[var(--ld-border)] bg-[var(--ld-bg-2)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel color="var(--warning)">Loved across Nigeria</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              The streets are talking 🗣️
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <GlassCard key={t.name} className="flex flex-col p-7">
                <Quote size={28} style={{ color: t.tint }} />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[var(--ld-text-2)]">“{t.quote}”</blockquote>
                <div className="mt-6 flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <figcaption className="mt-3">
                  <span className="font-display text-[14.5px] font-semibold text-[var(--ld-text)]">{t.name}</span>
                  <span className="ml-2 text-[13px] text-[var(--ld-text-muted)]">{t.role}</span>
                </figcaption>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Roadmap / what's coming ───────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel color="var(--primary)">On the roadmap</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              The event&apos;s just getting started
            </h2>
            <p className="mt-4 text-[16px] text-[var(--ld-text-2)]">
              Here&apos;s what we&apos;re building next to make Confette even better.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map(item => (
              <GlassCard key={item.title} className="group p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `color-mix(in srgb, ${item.tint} 18%, transparent)`, color: item.tint }}
                  >
                    <item.icon size={22} strokeWidth={1.9} />
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[16px] font-semibold text-[var(--ld-text)]">{item.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ld-text-2)]">{item.body}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <section id="faq" className="border-y border-[var(--ld-border)] bg-[var(--ld-bg-2)] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <SectionLabel color="var(--primary)">Good to know</SectionLabel>
            <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
              Questions? We&apos;ve got answers
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map(faq => (
              <details key={faq.q} className="group rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass)] p-5 backdrop-blur-xl [&_svg]:open:rotate-45">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-display text-[16px] font-semibold text-[var(--ld-text)]">{faq.q}</span>
                  <Plus size={20} className="shrink-0 text-[var(--ld-text-muted)] transition-transform duration-200" />
                </summary>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ld-text-2)]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Final CTA ───────────────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[var(--ld-border)] bg-[var(--ld-glass)] px-6 py-10 text-center backdrop-blur-xl sm:px-10">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="animate-aurora absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/30 blur-[80px]" />
            <div className="animate-aurora absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-[#FF6B9D]/25 blur-[80px]" style={{ animationDelay: '5s' }} />
          </div>
          <div className="relative">
            <div className="mb-4 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-dark shadow-lg shadow-primary/30">
                <PartyPopper size={24} />
              </span>
            </div>
            <h2 className="font-display text-[26px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[32px]">
              Ready to throw something unforgettable?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-[var(--ld-text-2)]">
              Join thousands of organisers and vendors making events happen across Nigeria. Start free today.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup?role=organiser" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-dark transition-colors hover:bg-primary/90 sm:w-auto">
                Start planning <ArrowRight size={17} />
              </Link>
              <Link href="/signup?role=vendor" className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--ld-border)] bg-[var(--ld-glass)] px-7 py-3.5 text-[15px] font-semibold text-[var(--ld-text)] transition-colors hover:bg-[var(--ld-glass-strong)] sm:w-auto">
                Sell your services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Contact ───────────────── */}
      <section id="contact" className="relative overflow-hidden border-t border-[var(--ld-border)] py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-aurora absolute left-1/4 top-0 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <SectionLabel color="var(--primary)">Contact</SectionLabel>
          <h2 className="mt-3 font-display text-[30px] font-bold tracking-[-0.01em] text-[var(--ld-text)] sm:text-[40px]">
            Let&apos;s plan something great
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--ld-text-2)]">
            Questions, partnerships, or just need a hand getting started? Reach out and our team will get back to you.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Mail, label: 'Email us', value: 'hello@confette.ng', href: 'mailto:hello@confette.ng' },
              { icon: Phone, label: 'Call us', value: '+234 800 000 0000', href: 'tel:+2348000000000' },
              { icon: MapPin, label: 'Find us', value: 'Lagos, Nigeria', href: null },
            ].map(c => {
              const inner = (
                <>
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <c.icon size={20} />
                  </span>
                  <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--ld-text-muted)]">{c.label}</p>
                  <p className="mt-1 text-[15px] font-medium text-[var(--ld-text)]">{c.value}</p>
                </>
              )
              return c.href ? (
                <a key={c.label} href={c.href} className="rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass)] p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/40">
                  {inner}
                </a>
              ) : (
                <div key={c.label} className="rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass)] p-6 backdrop-blur-xl">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── Footer ───────────────── */}
      <footer className="border-t border-[var(--ld-border)] bg-[var(--ld-bg-2)] px-6 pt-16 pb-10">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + socials */}
          <div className="lg:col-span-1">
            <AppLogo size={28} nameClassName="font-display font-bold text-[17px] tracking-[-0.01em] text-[var(--ld-text)]" />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[var(--ld-text-2)]">
              Nigeria&apos;s event planning marketplace. Plan boldly, celebrate safely.
            </p>
            <SocialLinks className="mt-5" />
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-display text-[14px] font-semibold text-[var(--ld-text)]">Product</h3>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li><a href="#how-it-works" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">How it works</a></li>
              <li><a href="#events" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">Events</a></li>
              <VendorsFooterLink />
              <li><a href="#escrow" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">Escrow</a></li>
              <li><a href="#faq" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">FAQ</a></li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="font-display text-[14px] font-semibold text-[var(--ld-text)]">Get started</h3>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li><Link href="/signup?role=organiser" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">Plan an event</Link></li>
              <li><Link href="/signup?role=vendor" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">Join as a vendor</Link></li>
              <li><Link href="/login" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">Log in</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-[14px] font-semibold text-[var(--ld-text)]">Company</h3>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li><a href="#contact" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">Contact us</a></li>
              <li><a href="mailto:hello@confette.ng" className="text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">hello@confette.ng</a></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-[var(--ld-border)] pt-6 sm:flex-row">
          <p className="text-[12.5px] text-[var(--ld-text-muted)]">© 2026 Confette. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-[12.5px] text-[var(--ld-text-muted)]">
            <Star size={13} className="text-warning" fill="currentColor" />
            Made for Nigerian celebrations
          </p>
        </div>
      </footer>
    </LandingShell>
  )
}
