'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { resolveDashboard } from '@/features/auth/portal'
import { AppLogo } from '@/features/shared-ui'
import { Menu, X } from 'lucide-react'
import { useFeaturedVendors } from './LandingShell'

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Events', href: '#events' },
  { label: 'Vendors', href: '#vendors' },
  { label: 'Escrow', href: '#escrow' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export function LandingNav() {
  const { user } = useAuth()
  const { vendors } = useFeaturedVendors()
  const [open, setOpen] = useState(false)
  const dashboard = user ? resolveDashboard(user) : null

  // Drop the "Vendors" anchor when the showcase section is hidden (no verified vendors).
  const hasVendors = !!vendors && vendors.length > 0
  const links = hasVendors ? LINKS : LINKS.filter(l => l.href !== '#vendors')

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass-strong)] px-5 py-3 shadow-lg shadow-black/5 backdrop-blur-xl">
        <Link href="/" aria-label="Confette home" className="flex items-center">
          <AppLogo size={30} nameClassName="font-display font-bold text-[19px] tracking-[-0.01em] text-[var(--ld-text)]" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-[14px] font-medium text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {dashboard ? (
            <Link href={dashboard} className="rounded-xl bg-primary px-5 py-2.5 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[14px] font-medium text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-text)]">
                Log in
              </Link>
              <Link href="/signup" className="rounded-xl bg-primary px-5 py-2.5 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90">
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ld-text)]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-glass-strong)] p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[var(--ld-text-muted)] hover:bg-[var(--ld-glass)] hover:text-[var(--ld-text)]"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[var(--ld-border)] pt-3">
              {dashboard ? (
                <Link href={dashboard} className="rounded-xl bg-primary px-5 py-3 text-center text-[15px] font-semibold text-dark">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl border border-[var(--ld-border)] px-5 py-3 text-center text-[15px] font-medium text-[var(--ld-text)]">
                    Log in
                  </Link>
                  <Link href="/signup" className="rounded-xl bg-primary px-5 py-3 text-center text-[15px] font-semibold text-dark">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default LandingNav
