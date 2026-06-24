'use client'
import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Check } from 'lucide-react'

export type DateFilter =
  | { kind: 'all' }
  | { kind: 'flexible' }
  | { kind: 'month'; key: string }
  | { kind: 'range'; from: string; to: string }

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
function shortDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

interface Props {
  value: DateFilter
  onChange: (v: DateFilter) => void
  /** Detected "YYYY-MM" month keys (plus optional 'flexible') for quick picks. */
  months: string[]
  monthLabel: (key: string) => string
}

export function DateRangeFilter({ value, onChange, months, monthLabel }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const today = new Date()
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  // Draft range while the user is clicking days.
  const [from, setFrom] = useState<string | null>(value.kind === 'range' ? value.from : null)
  const [to, setTo] = useState<string | null>(value.kind === 'range' ? value.to : null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const label =
    value.kind === 'all' ? 'Any date'
      : value.kind === 'flexible' ? 'Flexible date'
        : value.kind === 'month' ? monthLabel(value.key)
          : `${shortDate(value.from)} – ${shortDate(value.to)}`

  function pickDay(day: number) {
    const picked = ymd(cursor.year, cursor.month, day)
    if (!from || (from && to)) { setFrom(picked); setTo(null) }
    else if (picked >= from) setTo(picked)
    else { setFrom(picked); setTo(null) }
  }
  function applyRange() {
    if (from) { onChange({ kind: 'range', from, to: to ?? from }); setOpen(false) }
  }
  function choose(v: DateFilter) { onChange(v); setOpen(false) }

  const grid = monthGrid(cursor.year, cursor.month)

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex w-[150px] shrink-0 items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors ${
          open ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/40'
        } ${value.kind !== 'all' ? 'text-ink' : 'text-ink-3'} bg-white`}
      >
        <span className="truncate flex items-center gap-1.5"><CalendarDays size={14} className={value.kind !== 'all' ? 'text-primary' : 'text-ink-3'} />{label}</span>
        <ChevronLeft size={14} className={`shrink-0 -rotate-90 text-ink-3 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[300px] rounded-2xl border border-border bg-white p-3 shadow-xl shadow-ink/10">
          {/* Quick picks */}
          <div className="flex flex-wrap gap-1.5">
            <Chip active={value.kind === 'all'} onClick={() => choose({ kind: 'all' })}>Any date</Chip>
            {months.filter(m => m !== 'flexible').map(k => (
              <Chip key={k} active={value.kind === 'month' && value.key === k} onClick={() => choose({ kind: 'month', key: k })}>{monthLabel(k)}</Chip>
            ))}
            {months.includes('flexible') && (
              <Chip active={value.kind === 'flexible'} onClick={() => choose({ kind: 'flexible' })}>Flexible</Chip>
            )}
          </div>

          <div className="my-3 border-t border-border" />
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">Or pick a range</p>

          {/* Calendar */}
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-[13px] font-semibold text-ink">{MONTHS[cursor.month]} {cursor.year}</p>
            <div className="flex gap-1">
              <button type="button" onClick={() => setCursor(c => ({ year: c.month === 0 ? c.year - 1 : c.year, month: (c.month + 11) % 12 }))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 hover:bg-canvas hover:text-ink"><ChevronLeft size={15} /></button>
              <button type="button" onClick={() => setCursor(c => ({ year: c.month === 11 ? c.year + 1 : c.year, month: (c.month + 1) % 12 }))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 hover:bg-canvas hover:text-ink"><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map(w => <span key={w} className="py-1 text-center text-[10px] font-medium text-ink-3">{w}</span>)}
            {grid.map((day, i) => {
              if (day === null) return <span key={`b${i}`} />
              const key = ymd(cursor.year, cursor.month, day)
              const isFrom = key === from, isTo = key === to
              const inRange = from && to && key > from && key < to
              return (
                <button key={day} type="button" onClick={() => pickDay(day)}
                  className={`flex h-8 items-center justify-center rounded-lg text-[12px] transition-colors ${
                    isFrom || isTo ? 'bg-primary font-semibold text-dark' : inRange ? 'bg-primary/15 text-ink' : 'text-ink hover:bg-primary/10'
                  }`}>{day}</button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button type="button" onClick={() => { setFrom(null); setTo(null); choose({ kind: 'all' }) }}
              className="text-[12px] text-ink-3 hover:text-ink">Clear</button>
            <button type="button" onClick={applyRange} disabled={!from}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-dark hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
              <Check size={13} /> Apply range
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-lg border px-2.5 py-1 text-[12px] transition-colors ${active ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-border text-ink-2 hover:border-primary/30'}`}>
      {children}
    </button>
  )
}

export default DateRangeFilter
