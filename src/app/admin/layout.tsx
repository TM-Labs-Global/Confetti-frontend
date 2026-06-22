import type { ReactNode } from 'react'
'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import NotificationBell from '@/features/notifications/components/NotificationBell'
import { AppLogo } from '@/features/shared-ui'

const NAV = [
  { label: 'Dashboard',   path: '/admin/dashboard' },
  { label: 'All Plans',   path: '/admin/plans' },
  { label: 'Categories',  path: '/admin/categories' },
]



export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router                    = useRouter()
  const pathname                  = usePathname()
  const [mounted, setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || loading) return
    if (!user) router.replace('/login')
    else if (user.role !== 'admin') router.replace(`/${user.role}/dashboard`)
  }, [mounted, loading, user, router])

  if (!mounted || loading || !user || user.role !== 'admin') return null

  const initials  = user.name?.split(' ').map(n => n[0]).join('') ?? 'U'
  const firstName = user.name?.split(' ')[0] ?? ''

  return (
    <div className="flex h-screen bg-dark">
      <aside className="w-[248px] bg-dark flex flex-col shrink-0 border-r border-dark-border">
        <div className="px-6 pt-8 pb-12">
          <AppLogo size={32} nameClassName="font-display font-bold text-[18px] tracking-[-0.01em] text-white" />
        </div>

        <nav className="flex-1 px-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-dark-muted mb-2 px-2.5">
            Admin
          </div>
          {NAV.map(({ label, path }) => {
            const isActive = pathname === path || (path !== '/admin/dashboard' && pathname?.startsWith(path))
            return (
              <Link
                key={path}
                href={path}
                className={`block text-[14px] px-2.5 py-[7px] rounded-[6px] mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
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
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
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
        <header className="h-[57px] bg-dark-surface border-b border-dark-border flex items-center px-8 shrink-0 z-10">
          <span className="font-display font-semibold text-[14px] text-dark-muted">Admin Portal</span>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell dark />
            <div className="w-px h-4 bg-dark-border" />
            <span className="text-[13px] text-dark-muted">{firstName}</span>
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-dark">
          {children}
        </main>
      </div>
    </div>
  )
}
