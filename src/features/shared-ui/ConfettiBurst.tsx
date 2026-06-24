'use client'
import { useEffect, useState, useCallback } from 'react'

const COLORS = ['#00C4CC', '#39E75F', '#FFDE59', '#FF6B9D', '#7CE0FF', '#FFFFFF']

interface Piece {
  id: number
  cx: number
  cy: number
  cr: number
  size: number
  color: string
  circle: boolean
  delay: number
}

interface ConfettiBurstProps {
  /** 'hero' anchors inside a positioned hero; 'center' fills the viewport. */
  variant?: 'hero' | 'center'
  /** Re-fire whenever this value changes (in addition to the initial mount). */
  fireKey?: string | number
}

// A one-shot celebratory confetti burst that explodes outward and fades.
// Fires on mount (and when fireKey changes). Honours prefers-reduced-motion.
export function ConfettiBurst({ variant = 'hero', fireKey }: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<Piece[]>([])

  const fire = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const batch: Piece[] = Array.from({ length: 70 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist = 140 + Math.random() * 460
      return {
        id: Date.now() + i,
        cx: Math.cos(angle) * dist,
        cy: Math.sin(angle) * dist * 0.7 + 120 + Math.random() * 220,
        cr: Math.random() * 960 - 480,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        circle: Math.random() > 0.5,
        delay: Math.random() * 0.12,
      }
    })
    setPieces(batch)
    window.setTimeout(() => setPieces([]), 2800)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(fire, 250)
    return () => window.clearTimeout(t)
  }, [fire, fireKey])

  const wrapper =
    variant === 'center'
      ? 'pointer-events-none fixed inset-0 z-[60] flex items-start justify-center pt-[24vh]'
      : 'pointer-events-none absolute inset-x-0 top-[26%] z-20 flex justify-center'

  return (
    <div className={wrapper} aria-hidden>
      <div className="relative h-0 w-0">
        {pieces.map(p => (
          <span
            key={p.id}
            className="confetti-burst-piece absolute"
            style={{
              width: p.size,
              height: p.circle ? p.size : p.size * 0.45,
              background: p.color,
              borderRadius: p.circle ? '9999px' : '1px',
              animationDelay: `${p.delay}s`,
              ['--cx' as string]: `${p.cx}px`,
              ['--cy' as string]: `${p.cy}px`,
              ['--cr' as string]: `${p.cr}deg`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default ConfettiBurst
