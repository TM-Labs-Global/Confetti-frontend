'use client'
import type { ReactNode } from 'react'
import { PortalShell, type NavItem } from '@/features/shared-ui'
import { useAuth } from '@/features/auth/context/AuthContext'

const NAV: NavItem[] = [
  { label: 'Dashboard',     path: '/organiser/dashboard' },
  { label: 'Create an Event', path: '/organiser/create-plan' },
  { label: 'My Events',     path: '/organiser/plans' },
  { label: 'Find Vendors',  path: '/organiser/marketplace' },
]

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const suspended = user?.status === 'suspended'
  return (
    <PortalShell role="organiser" roleLabel="Organiser" nav={NAV} accent="primary" surface="light" themeToggle>
      {suspended && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <span className="font-semibold">Your account is suspended.</span> You can view your events, but you can&apos;t create events, accept bids, or invite vendors until it&apos;s reinstated. Please contact support if you think this is a mistake.
        </div>
      )}
      {children}
    </PortalShell>
  )
}
