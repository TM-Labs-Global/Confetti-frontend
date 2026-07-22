'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

// The landing page ships in a single (light) mode now - no toggle. The context
// stays so existing consumers keep working; theme is always 'light'.
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export const useLandingTheme = () => useContext(ThemeCtx)

// Verified vendors for the marketing page, fetched once and shared so the
// showcase section AND the nav/footer links all hide together when there are
// none. `null` = not loaded yet (treated as "no vendors" for hide decisions).
export interface FeaturedVendor {
  businessName: string
  bio: string
  state: string
  city: string
  specialties: string[]
}

const VendorsCtx = createContext<{ vendors: FeaturedVendor[] | null }>({ vendors: null })
export const useFeaturedVendors = () => useContext(VendorsCtx)

export function LandingShell({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<FeaturedVendor[] | null>(null)

  // Load the public vendor showcase once for the whole page.
  useEffect(() => {
    let active = true
    fetch('/api/vendors/featured')
      .then(r => (r.ok ? r.json() : { vendors: [] }))
      .then(d => { if (active) setVendors(d.vendors ?? []) })
      .catch(() => { if (active) setVendors([]) })
    return () => { active = false }
  }, [])

  return (
    <ThemeCtx.Provider value={{ theme: 'light', toggle: () => {} }}>
      <VendorsCtx.Provider value={{ vendors }}>
        <div
          className="landing min-h-screen bg-[var(--ld-bg)] text-[var(--ld-text)]"
          data-theme="light"
        >
          {children}
        </div>
      </VendorsCtx.Provider>
    </ThemeCtx.Provider>
  )
}

export default LandingShell
