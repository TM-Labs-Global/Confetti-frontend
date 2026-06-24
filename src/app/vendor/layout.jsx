'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { label: 'Dashboard',   path: '/vendor/dashboard' },
  { label: 'Open Plans',  path: '/vendor/marketplace' },
  { label: 'My Bids',     path: '/vendor/bids' },
]

function LogoMark() {
  return (
    <div className="relative w-8 h-8 rounded-[9px] shrink-0"
      style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #39E75F 100%)' }}>
      <div className="absolute top-[7px] left-[7px] w-2 h-2 bg-warning rounded-[2px] rotate-[20deg]" />
    </div>
  )
}

export default function VendorLayout({ children }) {
  const { user, loading, logout } = useAuth()
  const router                    = useRouter()
  const pathname                  = usePathname()
  const [mounted, setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || loading) return
    if (!user) router.replace('/login')
    else if (user.role !== 'vendor') router.replace(`/${user.role}/dashboard`)
  }, [mounted, loading, user, router])

  if (!mounted || loading || !user || user.role !== 'vendor') return null

  const initials  = user.name?.split(' ').map(n => n[0]).join('') ?? 'U'
  const firstName = user.name?.split(' ')[0] ?? ''

  return (
    <div className="flex h-screen bg-canvas">
      <aside className="w-[248px] bg-dark flex flex-col shrink-0 border-r border-dark-border">
        <div className="px-6 pt-8 pb-12 flex items-center gap-2">
          <LogoMark />
          <span className="font-display font-bold text-[18px] tracking-[-0.01em] text-white">Confetti</span>
        </div>

        <nav className="flex-1 px-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-dark-muted mb-2 px-2.5">
            Vendor
          </div>
          {NAV.map(({ label, path }) => {
            const isActive = pathname === path || (path !== '/vendor/dashboard' && pathname.startsWith(path))
            return (
              <Link
                key={path}
                href={path}
                className={`block text-[14px] px-2.5 py-[7px] rounded-[6px] mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-warning/10 text-warning font-medium'
                    : 'text-[#C9D0DE] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-6 pt-4 border-t border-dark-border">
          <div className="flex items-center gap-3 px-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-warning/20 text-warning text-[11px] font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-[13px] font-medium leading-none truncate">{user.name}</p>
              <p className="text-dark-muted text-[11px] mt-0.5 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/login') }}
            className="block w-full text-left text-[13px] text-dark-muted hover:text-white px-2.5 py-[7px] rounded-[6px] hover:bg-white/[0.06] transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[57px] bg-white border-b border-border flex items-center px-8 shrink-0 z-10">
          <h1 className="font-display font-semibold text-[14px] text-ink-2">Vendor Portal</h1>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <div className="w-px h-4 bg-border" />
            <span className="text-[13px] text-ink-3">{firstName}</span>
            <div className="w-7 h-7 rounded-full bg-warning/20 text-warning text-[11px] font-bold flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
