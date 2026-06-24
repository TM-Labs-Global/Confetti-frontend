'use client'
import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

function monthGrid(year: number, month: number) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = Array(lead).fill(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  return cells
}
function pretty(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  /** 'YYYY-MM-DD' or '' for none. */
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** Render for a dark surface (admin). */
  dark?: boolean
  className?: string
}

/**
 * App-wide custom single-date picker. Calendar-icon trigger + popover calendar,
 * styled for both light (organiser/vendor) and dark (admin) surfaces. Avoids the
 * inconsistent native date input.
 */
export function SingleDatePicker({ value, onChange, placeholder = 'Pick a date', dark = false, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  // Cursor is set lazily on open so SSR render is deterministic (no new Date()).
  const [cursor, setCursor] = useState<{ year: number; month: number } | null>(null)

  useEffect(() => {
    if (!open) return
    if (!cursor) {
      const base = value ? value.split('-').map(Number) : null
      const now = new Date()
      setCursor(base ? { year: base[0], month: base[1] - 1 } : { year: now.getFullYear(), month: now.getMonth() })
    }
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, cursor, value])

  const trigger = dark
    ? `${open ? 'border-primary ring-2 ring-primary/20' : 'border-dark-border hover:border-primary/40'} bg-dark-surface ${value ? 'text-white' : 'text-dark-muted'}`
    : `${open ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/40'} bg-white ${value ? 'text-ink' : 'text-ink-3'}`

  const grid = cursor ? monthGrid(cursor.year, cursor.month) : []

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex w-[170px] shrink-0 items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors ${trigger}`}
      >
        <span className="truncate flex items-center gap-1.5">
          <CalendarDays size={14} className={value ? 'text-primary' : dark ? 'text-dark-muted' : 'text-ink-3'} />
          {value ? pretty(value) : placeholder}
        </span>
        <ChevronLeft size={14} className={`shrink-0 -rotate-90 transition-transform ${open ? 'rotate-90' : ''} ${dark ? 'text-dark-muted' : 'text-ink-3'}`} />
      </button>

      {open && cursor && (
        <div className={`absolute right-0 z-50 mt-2 w-[280px] rounded-2xl border p-3 shadow-xl ${dark ? 'border-dark-border bg-dark-surface shadow-black/30' : 'border-border bg-white shadow-ink/10'}`}>
          <div className="mb-2 flex items-center justify-between">
            <p className={`font-display text-[13px] font-semibold ${dark ? 'text-white' : 'text-ink'}`}>{MONTHS[cursor.month]} {cursor.year}</p>
            <div className="flex gap-1">
              <button type="button" onClick={() => setCursor(c => c && ({ year: c.month === 0 ? c.year - 1 : c.year, month: (c.month + 11) % 12 }))}
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? 'text-dark-muted hover:bg-white/[0.06] hover:text-white' : 'text-ink-3 hover:bg-canvas hover:text-ink'}`}><ChevronLeft size={15} /></button>
              <button type="button" onClick={() => setCursor(c => c && ({ year: c.month === 11 ? c.year + 1 : c.year, month: (c.month + 1) % 12 }))}
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? 'text-dark-muted hover:bg-white/[0.06] hover:text-white' : 'text-ink-3 hover:bg-canvas hover:text-ink'}`}><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map(w => <span key={w} className={`py-1 text-center text-[10px] font-medium ${dark ? 'text-dark-muted' : 'text-ink-3'}`}>{w}</span>)}
            {grid.map((day, i) => {
              if (day === null) return <span key={`b${i}`} />
              const key = ymd(cursor.year, cursor.month, day)
              const selected = key === value
              return (
                <button key={day} type="button" onClick={() => { onChange(key); setOpen(false) }}
                  className={`flex h-8 items-center justify-center rounded-lg text-[12px] transition-colors ${
                    selected
                      ? 'bg-primary font-semibold text-dark'
                      : dark ? 'text-white hover:bg-primary/20' : 'text-ink hover:bg-primary/10'
                  }`}>{day}</button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              className={`text-[12px] ${dark ? 'text-dark-muted hover:text-white' : 'text-ink-3 hover:text-ink'}`}>Clear</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SingleDatePicker
