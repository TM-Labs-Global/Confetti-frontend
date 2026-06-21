'use client'
import { useState, useEffect } from 'react'
import { timeAgo } from '../utils/format'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

const TYPE_LABELS = {
  bid_received: 'Bid received',
  bid_accepted: 'Bid accepted',
  bid_updated:  'Bid updated',
  new_plan:     'New plan',
}

export default function NotificationBell({ dark = false }) {
  const [open, setOpen]     = useState(false)
  const [notifs, setNotifs] = useState([])

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(data => setNotifs(data.notifications ?? []))
  }, [])

  const unread = notifs.filter(n => !n.isRead).length

  async function markAll() {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    await fetch('/api/notifications', { method: 'PUT' })
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
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
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
                  <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-mono">
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
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
                    !n.isRead ? 'bg-primary/[0.03]' : 'hover:bg-canvas'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-mono uppercase tracking-[0.06em] text-ink-3 mb-0.5">
                      {TYPE_LABELS[n.type] ?? n.type}
                    </p>
                    <p className="text-[13px] text-ink leading-snug">{n.message}</p>
                    <p className="text-[11px] text-ink-3 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
