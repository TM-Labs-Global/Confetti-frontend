'use client'
import { useState } from 'react'
import { EventTile, StatusBadge, StatCard, EmptyState, Tabs, BudgetBar, Breadcrumb, PageHeader } from '@/features/shared-ui'
import NotificationBell from '@/features/notifications/components/NotificationBell'
import { MOCK_NOTIFICATIONS } from '@/data/mockNotifications'
import { STATUS_META } from '@/data/mockPlans'
import { BID_STATUS_META } from '@/data/mockBids'
import { EVENT_META } from '@/data/mockCategories'
import { fmtNaira } from '@/shared/utils/format'

interface SectionProps {
  title: string
  dark?: boolean
  children: React.ReactNode
}

function Section({ title, dark = false, children }: SectionProps) {
  return (
    <section className={`mb-14 ${dark ? 'bg-dark p-8 rounded-2xl' : ''}`}>
      <p className={`text-[11px] font-mono uppercase tracking-[0.1em] mb-6 ${dark ? 'text-dark-muted' : 'text-ink-3'}`}>
        {title}
      </p>
      {children}
    </section>
  )
}

interface SwatchProps {
  name: string
  hex: string
  className: string
}

function Swatch({ name, hex, className }: SwatchProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full h-14 rounded-xl border border-black/10 ${className}`} />
      <p className="text-[12px] font-medium text-ink">{name}</p>
      <p className="text-[11px] font-mono text-ink-3">{hex}</p>
    </div>
  )
}

const PLAN_TABS = [
  { id: 'all',       label: 'All',       count: 4 },
  { id: 'open',      label: 'Open',      count: 2 },
  { id: 'bidding',   label: 'Bidding',   count: 1 },
  { id: 'draft',     label: 'Draft',     count: 1 },
  { id: 'completed', label: 'Completed', count: 0 },
]

const MOCK_NOTIFS = MOCK_NOTIFICATIONS.organiser

export default function DesignSystemPage() {
  const [tab,  setTab]  = useState('all')
  const [tab2, setTab2] = useState('pending')

  const weddingMeta = EVENT_META['wedding']
  const bday        = EVENT_META['birthday']
  const corporate   = EVENT_META['corporate']

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-[940px] mx-auto px-8 py-14">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-10 h-10 rounded-[11px]"
              style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #39E75F 100%)' }}>
              <div className="absolute top-[9px] left-[9px] w-[10px] h-[10px] bg-warning rounded-[2px] rotate-[20deg]" />
            </div>
            <span className="font-display font-bold text-[24px] tracking-[-0.01em] text-ink">Confette</span>
          </div>
          <h1 className="font-display font-bold text-[38px] text-ink leading-tight mb-2">Design System</h1>
          <p className="text-ink-3 text-[16px]">Colours · Typography · Components</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[12px] font-medium text-primary">
            Phase 1 · {Object.keys(EVENT_META).length} event types · 8 UI components
          </div>
        </div>

        {/* COLOURS */}
        <Section title="Brand Colours">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Swatch name="Primary / Organiser" hex="#00C4CC" className="bg-primary" />
            <Swatch name="Warning / Vendor"    hex="#FFDE59" className="bg-warning" />
            <Swatch name="Success"             hex="#39E75F" className="bg-success" />
          </div>
          <div className="grid grid-cols-5 gap-4">
            <Swatch name="Canvas"     hex="#FAFAFC" className="bg-canvas" />
            <Swatch name="Border"     hex="#E4E7EC" className="bg-border" />
            <Swatch name="Ink"        hex="#101828" className="bg-ink" />
            <Swatch name="Ink-2"      hex="#475467" className="bg-ink-2" />
            <Swatch name="Ink-3"      hex="#667085" className="bg-ink-3" />
          </div>
        </Section>

        <Section title="Dark Surfaces" dark>
          <div className="grid grid-cols-4 gap-4">
            <Swatch name="Dark"         hex="#0B0F19"   className="bg-dark border border-dark-border" />
            <Swatch name="Dark Surface" hex="#161F30"   className="bg-dark-surface" />
            <Swatch name="Dark Border"  hex="#283248"   className="bg-dark-border" />
            <Swatch name="Dark Muted"   hex="#8B96AC"   className="bg-dark-muted rounded-xl h-14" />
          </div>
        </Section>

        {/* TYPOGRAPHY */}
        <Section title="Typography">
          <div className="space-y-5 bg-white border border-border rounded-2xl p-8">
            <div>
              <p className="text-[11px] font-mono text-ink-3 mb-1">font-display · Bricolage Grotesque</p>
              <p className="font-display font-bold text-[36px] text-ink leading-none">Plan the perfect event</p>
            </div>
            <div>
              <p className="text-[11px] font-mono text-ink-3 mb-1">font-sans · Plus Jakarta Sans</p>
              <p className="text-[16px] text-ink-2 leading-relaxed">Connect with trusted vendors across Nigeria. From Jollof catering to Afrobeats DJs, find everything in one place.</p>
            </div>
            <div>
              <p className="text-[11px] font-mono text-ink-3 mb-1">font-mono · DM Mono</p>
              <p className="font-mono text-[13px] text-ink-3 uppercase tracking-[0.08em]">WS-2026 · SHARE CODE · 7 BIDS</p>
            </div>
          </div>
        </Section>

        {/* EVENT TILES */}
        <Section title="EventTile · 4 sizes">
          <div className="bg-white border border-border rounded-2xl p-8">
            <div className="flex items-end gap-8 mb-8">
              {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <EventTile type="wedding" bg={weddingMeta.bg} color={weddingMeta.color} size={size} />
                  <p className="font-mono text-[11px] text-ink-3">{size}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(EVENT_META).map(([key, m]) => (
                <div key={key} className="flex items-center gap-2">
                  <EventTile type={key} bg={m.bg} color={m.color} size="sm" />
                  <span className="text-[12px] text-ink-2 capitalize">{key.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* STATUS BADGES */}
        <Section title="StatusBadge · Plan statuses">
          <div className="bg-white border border-border rounded-2xl p-8">
            <p className="text-[12px] text-ink-3 mb-4 font-mono">Plan statuses</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(STATUS_META).map(([key, s]) => (
                <div key={key} className="flex flex-col items-center gap-2">
                  <StatusBadge label={s.label} style={s.style} size="sm" />
                  <StatusBadge label={s.label} style={s.style} size="md" />
                  <p className="font-mono text-[10px] text-ink-3">{key}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-ink-3 mb-4 font-mono">Bid statuses</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(BID_STATUS_META).map(([key, s]) => (
                <div key={key} className="flex flex-col items-center gap-2">
                  <StatusBadge label={s.label} style={s.style} size="md" />
                  <p className="font-mono text-[10px] text-ink-3">{key}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* STAT CARDS */}
        <Section title="StatCard · Light surface">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Plans"  value={4} />
            <StatCard label="Live Plans"   value={2} accent="text-primary" />
            <StatCard label="Bids Pending" value={7} accent="text-[#D4A017]" />
            <StatCard label="Accepted"     value={1} accent="text-success" sub="this month" />
          </div>
        </Section>

        <Section title="StatCard · Dark surface" dark>
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Plans"  value={4}  dark />
            <StatCard label="Live Plans"   value={2}  dark accent="text-primary" />
            <StatCard label="Total Bids"   value={12} dark accent="text-warning" />
            <StatCard label="Event Types"  value={6}  dark />
          </div>
        </Section>

        {/* TABS */}
        <Section title="Tabs · 3 accent variants">
          <div className="bg-white border border-border rounded-2xl p-8 space-y-8">
            <div>
              <p className="text-[11px] font-mono text-ink-3 mb-3">accent=primary (organiser)</p>
              <Tabs tabs={PLAN_TABS} active={tab} onChange={setTab} accent="primary" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-ink-3 mb-3">accent=warning (vendor)</p>
              <Tabs
                tabs={[
                  { id: 'all',      label: 'All',      count: 4 },
                  { id: 'pending',  label: 'Pending',  count: 3 },
                  { id: 'accepted', label: 'Accepted', count: 1 },
                  { id: 'rejected', label: 'Rejected', count: 0 },
                ]}
                active={tab2}
                onChange={setTab2}
                accent="warning"
              />
            </div>
          </div>
          <div className="bg-dark rounded-2xl p-8 mt-4">
            <p className="text-[11px] font-mono text-dark-muted mb-3">accent=dark (admin)</p>
            <Tabs
              tabs={[
                { id: 'all',      label: 'All',      count: 4 },
                { id: 'open',     label: 'Open',     count: 2 },
                { id: 'bidding',  label: 'Bidding',  count: 1 },
                { id: 'draft',    label: 'Draft',    count: 1 },
              ]}
              active="all"
              onChange={() => {}}
              accent="dark"
            />
          </div>
        </Section>

        {/* BUDGET BARS */}
        <Section title="BudgetBar · Light + dark">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-2xl p-6 space-y-3.5">
              <p className="text-[11px] font-mono text-ink-3 mb-4">Light surface</p>
              <BudgetBar label="Catering & Jollof"   amount={fmtNaira(1500000)} pct={30} color={weddingMeta.color} />
              <BudgetBar label="Venue / Hall"         amount={fmtNaira(1000000)} pct={20} color={weddingMeta.color} badge="3 bids" />
              <BudgetBar label="Decoration & Rentals" amount={fmtNaira(600000)}  pct={12} color={weddingMeta.color} />
              <BudgetBar label="Photography"          amount={fmtNaira(400000)}  pct={8}  color={weddingMeta.color} badge="Vendor selected" />
            </div>
            <div className="bg-dark rounded-2xl p-6 space-y-3.5">
              <p className="text-[11px] font-mono text-dark-muted mb-4">Dark surface</p>
              <BudgetBar label="Catering & Jollof"   amount={fmtNaira(1500000)} pct={30} color={bday.color} dark />
              <BudgetBar label="Venue / Hall"         amount={fmtNaira(1000000)} pct={20} color={bday.color} dark badge="1 bid" />
              <BudgetBar label="DJ & Sound System"    amount={fmtNaira(250000)}  pct={5}  color={bday.color} dark />
            </div>
          </div>
        </Section>

        {/* BREADCRUMBS */}
        <Section title="Breadcrumb · Light + dark">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <Breadcrumb items={[{ label: 'My Plans', href: '/organiser/plans' }, { label: "Wale & Simi's Wedding" }]} />
              <Breadcrumb items={[{ label: 'Open Plans', href: '/vendor/marketplace' }, { label: 'Chike\'s 30th Birthday Bash' }]} />
            </div>
            <div className="bg-dark rounded-xl p-6 space-y-4">
              <Breadcrumb items={[{ label: 'All Plans', href: '/admin/plans' }, { label: "Wale & Simi's Wedding" }]} dark />
              <Breadcrumb items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Categories' }]} dark />
            </div>
          </div>
        </Section>

        {/* PAGE HEADER */}
        <Section title="PageHeader">
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-6">
              <PageHeader
                eyebrow="Organiser"
                title="My Plans"
                description="4 events · 2 open for bids"
                action={
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                    + Create an Event
                  </button>
                }
              />
            </div>
            <div className="bg-dark rounded-xl p-6">
              <PageHeader eyebrow="Platform" title="Admin Dashboard" dark />
            </div>
          </div>
        </Section>

        {/* EMPTY STATES */}
        <Section title="EmptyState · 3 variants">
          <div className="space-y-4">
            <EmptyState
              heading="No events yet"
              description="Create your first event and start collecting bids from vendors."
              action={{ label: 'Create an Event', href: '/organiser/create-plan', variant: 'primary' }}
            />
            <EmptyState
              heading="You haven't placed any bids yet"
              description="Browse open plans and send your first bid."
              action={{ label: 'Browse Open Plans', href: '/vendor/marketplace', variant: 'warning' }}
            />
            <EmptyState
              heading="No matching plans"
              description="Try a different filter or check back soon."
            />
          </div>
        </Section>

        {/* NOTIFICATION BELL */}
        <Section title="NotificationBell">
          <div className="bg-white border border-border rounded-xl p-6 flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-mono text-ink-3">Light surface</p>
              <NotificationBell notifications={MOCK_NOTIFS} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-mono text-ink-3">Dark (no unread)</p>
              <div className="bg-dark p-2 rounded-lg">
                <NotificationBell notifications={[]} dark />
              </div>
            </div>
          </div>
        </Section>

        {/* INTERACTIVE EXAMPLE */}
        <Section title="Composed Example · Plan card">
          <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all">
            <div className="flex items-center gap-4">
              <EventTile type="wedding" bg={weddingMeta.bg} color={weddingMeta.color} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-display font-semibold text-ink text-[14px] truncate">Wale &amp; Simi's Wedding</p>
                  <StatusBadge label="Open" style={STATUS_META.open.style} />
                </div>
                <p className="text-ink-3 text-[12px]">20 Sep 2026 · Ikeja, Lagos</p>
              </div>
              <div className="flex items-center gap-6 text-right shrink-0">
                <div>
                  <p className="text-[13px] font-semibold text-ink tabular-nums">{fmtNaira(5000000)}</p>
                  <p className="text-[11px] text-ink-3">12 categories</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-primary">3</p>
                  <p className="text-[11px] text-ink-3">bids</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink-3">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
