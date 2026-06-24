'use client'
import type { ReactNode } from 'react'
import { PortalShell, type NavItem } from '@/features/shared-ui'

const NAV: NavItem[] = [
  { label: 'Dashboard',   path: '/vendor/dashboard' },
  { label: 'Open Events', path: '/vendor/marketplace' },
  { label: 'My Bids',     path: '/vendor/bids' },
  { label: 'My Profile',  path: '/vendor/profile' },
]

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell role="vendor" roleLabel="Vendor" nav={NAV} accent="warning" surface="light" themeToggle>
      {children}
    </PortalShell>
  )
}
