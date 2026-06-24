'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'confette-landing-theme'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
})

export const useLandingTheme = () => useContext(ThemeCtx)

export function LandingShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  // Restore preference after mount (avoids hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  const toggle = () =>
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div
        className="landing min-h-screen bg-[var(--ld-bg)] text-[var(--ld-text)] transition-colors duration-300"
        data-theme={theme}
      >
        {children}
      </div>
    </ThemeCtx.Provider>
  )
}

export default LandingShell
