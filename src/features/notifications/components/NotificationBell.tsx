'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { markOneRead } from '../services/notificationService'
import { timeAgo, humanizeKey } from '@/shared/utils/format'

const TYPE_LABELS: Record<string, string> = {
  bid_received:           'Bid received',
  bid_accepted:           'Bid accepted',
  bid_rejected:           'Bid declined',
  bid_withdrawn:          'Bid withdrawn',
  new_plan:               'New event',
  plan_flagged:           'Event flagged',
  plan_restored:          'Event restored',
  plan_updated:           'Event updated',
  vendor_verified:        'Profile verified',
  vendor_rejected:        'Profile update needed',
  vendor_suspended:       'Account suspended',
  vendor_pending:         'Profile under review',
  vendor_review:          'Vendor awaiting review',
  booked_vendor_suspended:'Booked vendor suspended',
  vendor_invited:         'Invitation',
  event_completed:        'Event wrapped up',
  // Account status (backend sends these as the notification type)
  account_suspended:      'Account suspended',
  account_reinstated:     'Account reinstated',
}

// Default route per notification type when the backend hasn't attached an explicit link.
const TYPE_ROUTES: Record<string, string> = {
  bid_received:            '/organiser/plans',
  bid_accepted:            '/vendor/bids',
  bid_rejected:            '/vendor/bids',
  bid_withdrawn:           '/organiser/plans',
  new_plan:                '/vendor/marketplace',
  plan_flagged:            '/organiser/plans',
  plan_restored:           '/organiser/plans',
  plan_updated:            '/vendor/bids',
  vendor_verified:         '/vendor/profile',
  vendor_rejected:         '/vendor/profile',
  vendor_suspended:        '/vendor/profile',
  vendor_pending:          '/vendor/profile',
  vendor_review:           '/admin/vendors',
  booked_vendor_suspended: '/organiser/plans',
  vendor_invited:          '/vendor/marketplace',
  event_completed:         '/vendor/bids',
}

function routeFor(n: any): string | null {
  if (n.link) return n.link
  if (n.planId && (n.type === 'bid_received' || n.type === 'bid_updated')) return `/organiser/plans/${n.planId}`
  if (n.planId && n.type === 'new_plan') return `/vendor/marketplace/${n.planId}`
  return TYPE_ROUTES[n.type] ?? null
}

interface NotificationBellProps {
  dark?: boolean
  notifications?: any[]
}

export default function NotificationBell({ dark = false, notifications: propNotifications }: NotificationBellProps) {
  const hookData = useNotifications()
  const router = useRouter()
  const [localNotifs, setLocalNotifs] = useState<any[] | null>(null)
  const [open, setOpen] = useState(false)

  const notifs = propNotifications ? (localNotifs ?? propNotifications) : hookData.notifs
  const unread = propNotifications
    ? notifs.filter(n => !n.isRead).length
    : hookData.unread

  const markAll = () => {
    if (propNotifications) {
      setLocalNotifs(notifs.map(n => ({ ...n, isRead: true })))
    } else {
      hookData.markAll()
    }
  }

  const handleClick = (n: any) => {
    // Mark this one read…
    if (!n.isRead) {
      if (propNotifications) {
        setLocalNotifs(notifs.map(x => (x.id === n.id ? { ...x, isRead: true } : x)))
        markOneRead(n.id)
      } else {
        hookData.markOne(n.id)
      }
    }
    // …then open the related page.
    const dest = routeFor(n)
    setOpen(false)
    if (dest) router.push(dest)
  }

  const btn   = dark
    ? 'text-dark-muted hover:text-white hover:bg-white/[0.06]'
    : 'text-ink-3 hover:text-ink hover:bg-border/50'

  const panel = 'absolute right-0 top-11 w-[340px] bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${btn}`}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-[#fff] text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={panel}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-display font-semibold text-[13px] text-ink">
                Notifications
                {unread > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">
                    {unread} new
                  </span>
                )}
              </span>
              {unread > 0 && (
                <button onClick={markAll} className="text-[12px] text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
              {notifs.length === 0 ? (
                <p className="text-ink-3 text-[13px] text-center py-10">No notifications yet</p>
              ) : notifs.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors ${
                    !n.isRead ? 'bg-primary/[0.03] hover:bg-primary/[0.07]' : 'hover:bg-canvas'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium tracking-[0.01em] text-ink-3 mb-0.5">
                      {TYPE_LABELS[n.type] ?? humanizeKey(n.type)}
                    </p>
                    <p className="text-[13px] text-ink leading-snug">{n.message}</p>
                    <p className="text-[11px] text-ink-3 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
