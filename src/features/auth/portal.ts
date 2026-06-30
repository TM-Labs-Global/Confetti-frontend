import type { AuthUser, Portal } from './types/auth.types'

// Where a dual-role user's last-used portal is remembered, so switching between
// the organiser and vendor portals "sticks" across navigations and sign-ins.
const LAST_PORTAL_KEY = 'confette:last-portal'

export function rememberPortal(portal: Portal): void {
  try { window.localStorage.setItem(LAST_PORTAL_KEY, portal) } catch { /* storage unavailable */ }
}

export function getRememberedPortal(): Portal | null {
  try {
    const v = window.localStorage.getItem(LAST_PORTAL_KEY)
    return v === 'organiser' || v === 'vendor' ? v : null
  } catch {
    return null
  }
}

// The portal a user should land on after auth. Admin always goes to the admin
// portal. A user holding both organiser + vendor lands on whichever they used
// last (defaulting to organiser); a single-role user lands on their one portal.
export function resolveDashboard(user: Pick<AuthUser, 'roles'>): string {
  if (user.roles.includes('admin')) return '/admin/dashboard'
  const remembered = getRememberedPortal()
  if (remembered && user.roles.includes(remembered)) return `/${remembered}/dashboard`
  if (user.roles.includes('organiser')) return '/organiser/dashboard'
  if (user.roles.includes('vendor')) return '/vendor/dashboard'
  return '/organiser/dashboard'
}
