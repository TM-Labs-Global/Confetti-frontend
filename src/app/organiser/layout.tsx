'use client'
import type { ReactNode } from 'react'
import { PortalShell, type NavItem } from '@/features/shared-ui'

const NAV: NavItem[] = [
  { label: 'Dashboard',     path: '/organiser/dashboard' },
  { label: 'Create an Event', path: '/organiser/create-plan' },
  { label: 'My Events',     path: '/organiser/plans' },
  { label: 'Find Vendors',  path: '/organiser/marketplace' },
]

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell role="organiser" roleLabel="Organiser" nav={NAV} accent="primary" surface="light" themeToggle>
      {children}
    </PortalShell>
  )
}
