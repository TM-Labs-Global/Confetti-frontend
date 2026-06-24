'use client'
import type { ReactNode } from 'react'
import { PortalShell, type NavItem } from '@/features/shared-ui'

const NAV: NavItem[] = [
  { label: 'Dashboard',   path: '/admin/dashboard' },
  { label: 'All Events',  path: '/admin/plans' },
  { label: 'Vendors',     path: '/admin/vendors' },
  { label: 'Event Types', path: '/admin/categories' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell role="admin" roleLabel="Admin" nav={NAV} accent="primary" surface="dark">
      {children}
    </PortalShell>
  )
}
