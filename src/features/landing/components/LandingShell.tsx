'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'confette-landing-theme'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
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
  const [theme, setTheme] = useState<Theme>('dark')
  const [vendors, setVendors] = useState<FeaturedVendor[] | null>(null)

  // Restore preference after mount (avoids hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  // Load the public vendor showcase once for the whole page.
  useEffect(() => {
    let active = true
    fetch('/api/vendors/featured')
      .then(r => (r.ok ? r.json() : { vendors: [] }))
      .then(d => { if (active) setVendors(d.vendors ?? []) })
      .catch(() => { if (active) setVendors([]) })
    return () => { active = false }
  }, [])

  const toggle = () =>
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <VendorsCtx.Provider value={{ vendors }}>
        <div
          className="landing min-h-screen bg-[var(--ld-bg)] text-[var(--ld-text)] transition-colors duration-300"
          data-theme={theme}
        >
          {children}
        </div>
      </VendorsCtx.Provider>
    </ThemeCtx.Provider>
  )
}

export default LandingShell
