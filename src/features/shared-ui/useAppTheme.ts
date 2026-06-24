'use client'
import { useEffect, useState } from 'react'

const KEY = 'confette-app-theme'

/**
 * Opt-in light/dark theme for the organiser & vendor content areas.
 * Light by default; persisted to localStorage. Admin is always dark and
 * does not use this.
 */
export function useAppTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  const toggle = () =>
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light'
      localStorage.setItem(KEY, next)
      return next
    })

  return { theme, toggle }
}
