'use client'
import { Sun, Moon } from 'lucide-react'

interface Props {
  theme: 'light' | 'dark'
  toggle: () => void
}

// Sun/Moon toggle for the organiser & vendor top bar. Uses surface tokens so
// it adapts when the content area flips to dark.
export function AppThemeToggle({ theme, toggle }: Props) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-3 transition-colors hover:bg-canvas hover:text-ink"
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

export default AppThemeToggle
