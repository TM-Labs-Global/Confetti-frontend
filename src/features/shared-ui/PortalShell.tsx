'use client'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/features/auth/context/AuthContext'
import NotificationBell from '@/features/notifications/components/NotificationBell'
import { AppLogo } from './AppLogo'
import { AppThemeToggle } from './AppThemeToggle'
import { useAppTheme } from './useAppTheme'

export interface NavItem {
  label: string
  path: string
}

interface PortalShellProps {
  role: 'organiser' | 'vendor' | 'admin'
  roleLabel: string
  nav: NavItem[]
  /** Accent used for active nav + avatar. */
  accent: 'primary' | 'warning'
  /** Chrome surface. Admin = dark, organiser/vendor = light. */
  surface: 'light' | 'dark'
  /** Show the light/dark content-area toggle (organiser & vendor only). */
  themeToggle?: boolean
  children: ReactNode
}

const ACCENT = {
  primary: { active: 'bg-primary/10 text-primary', avatar: 'bg-primary/20 text-primary' },
  warning: { active: 'bg-warning/10 text-warning', avatar: 'bg-warning/20 text-warning' },
}

const SURFACE = {
  light: {
    aside:    'bg-white border-border',
    border:   'border-border',
    label:    'text-ink-3',
    inactive: 'text-ink-2 hover:bg-ink/[0.06] hover:text-ink',
    name:     'text-ink',
    email:    'text-ink-3',
    signout:  'text-ink-3 hover:text-ink hover:bg-ink/[0.06]',
    logo:     'text-ink',
    header:   'bg-white border-border',
    iconBtn:  'text-ink-2 hover:bg-canvas',
  },
  dark: {
    aside:    'bg-dark border-dark-border',
    border:   'border-dark-border',
    label:    'text-dark-muted',
    inactive: 'text-[#C9D0DE] hover:bg-white/[0.06] hover:text-white',
    name:     'text-white',
    email:    'text-dark-muted',
    signout:  'text-dark-muted hover:text-white hover:bg-white/[0.06]',
    logo:     'text-white',
    header:   'bg-dark-surface border-dark-border',
    iconBtn:  'text-dark-muted hover:bg-white/[0.06]',
  },
}

export function PortalShell({ role, roleLabel, nav, accent, surface, themeToggle, children }: PortalShellProps) {
  const { user, loading, logout } = useAuth()
  const router                    = useRouter()
  const pathname                  = usePathname()
  const { theme, toggle }         = useAppTheme()
  const [mounted, setMounted]     = useState(false)
  const [drawerOpen, setDrawer]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || loading) return
    if (!user) router.replace('/login')
    else if (user.role !== role) router.replace(`/${user.role}/dashboard`)
  }, [mounted, loading, user, router, role])

  // Close the drawer whenever the route changes.
  useEffect(() => { setDrawer(false) }, [pathname])

  if (!mounted || loading || !user || user.role !== role) return null

  const s        = SURFACE[surface]
  const a        = ACCENT[accent]
  const initials = user.name?.split(' ').map(n => n[0]).join('') ?? 'U'
  const isDark   = surface === 'dark'

  const SidebarBody = (
    <>
      <div className="px-6 pt-8 pb-12 flex items-center justify-between">
        <Link href="/" aria-label="Confette home" className="inline-flex" onClick={() => setDrawer(false)}>
          <AppLogo size={32} nameClassName={`font-display font-bold text-[18px] tracking-[-0.01em] ${s.logo}`} />
        </Link>
        <button
          onClick={() => setDrawer(false)}
          aria-label="Close menu"
          className={`lg:hidden flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBtn} transition-colors`}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-4">
        <div className={`text-[11px] font-medium uppercase tracking-[0.08em] ${s.label} mb-2 px-2.5`}>
          {roleLabel}
        </div>
        {nav.map(({ label, path }) => {
          const isActive = pathname === path || (path !== `/${role}/dashboard` && pathname?.startsWith(path))
          return (
            <Link
              key={path}
              href={path}
              className={`block text-[14px] px-2.5 py-[7px] rounded-[6px] mb-0.5 transition-colors ${
                isActive ? `${a.active} font-medium` : s.inactive
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className={`px-4 pb-6 pt-4 border-t ${s.border}`}>
        <div className="flex items-center gap-3 px-2.5 mb-3">
          <div className={`w-7 h-7 rounded-full ${a.avatar} text-[11px] font-bold flex items-center justify-center shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className={`${s.name} text-[13px] font-medium leading-none truncate`}>{user.name}</p>
            <p className={`${s.email} text-[11px] mt-0.5 truncate`}>{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); router.push('/login') }}
          className={`block w-full text-left text-[13px] px-2.5 py-[7px] rounded-[6px] transition-colors ${s.signout}`}
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div data-app-theme={themeToggle ? theme : undefined} className={`flex h-screen ${isDark ? 'bg-dark' : 'bg-canvas'}`}>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex w-[248px] flex-col shrink-0 border-r ${s.aside}`}>
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setDrawer(false)} />
          <aside className={`relative flex w-[260px] max-w-[80vw] flex-col border-r ${s.aside} animate-slide-in-left`}>
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-dark' : 'bg-canvas'}`}>
        <header className={`h-[57px] border-b flex items-center gap-3 px-4 sm:px-6 lg:px-8 shrink-0 z-10 ${s.header}`}>
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className={`lg:hidden flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBtn} transition-colors`}
          >
            <Menu size={18} />
          </button>
          <Link href="/" aria-label="Confette home" className="lg:hidden inline-flex">
            <AppLogo size={26} nameClassName={`font-display font-bold text-[16px] tracking-[-0.01em] ${s.logo}`} />
          </Link>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {themeToggle && <AppThemeToggle theme={theme} toggle={toggle} />}
            <NotificationBell dark={isDark} />
            <div className={`w-7 h-7 rounded-full ${a.avatar} text-[11px] font-bold flex items-center justify-center`}>
              {initials}
            </div>
          </div>
        </header>
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-dark' : ''}`}>
          <div className="mx-auto w-full max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PortalShell
