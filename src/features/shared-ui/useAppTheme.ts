'use client'
import { useEffect, useState } from 'react'

const KEY = 'confette-app-theme'

/**
 * Light/dark theme for the organiser & vendor content areas. Defaults to dark
 * on desktop and light on smaller screens; the user's choice is persisted to
 * localStorage and always wins. Admin is always dark and does not use this.
 */
export function useAppTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') { setTheme(saved); return }
    // No saved preference yet: default to dark on desktop, light on phones/tablets.
    if (window.matchMedia('(min-width: 1024px)').matches) setTheme('dark')
  }, [])

  const toggle = () =>
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light'
      localStorage.setItem(KEY, next)
      return next
    })

  return { theme, toggle }
}
