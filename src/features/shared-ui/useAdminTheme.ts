'use client'
import { useEffect, useState } from 'react'

const KEY = 'confette-admin-theme'

/**
 * Light/dark theme for the admin portal. Defaults to dark (the admin portal's
 * original look) on every device; the user's choice is persisted to
 * localStorage and always wins. Separate from useAppTheme so an admin who also
 * uses the organiser/vendor portals keeps independent preferences.
 */
export function useAdminTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

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
