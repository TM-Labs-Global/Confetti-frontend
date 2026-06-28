'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

/* ------------------------------------------------------------------ helpers */
// Values are stored as "YYYY-MM-DDTHH:mm" (local, matching <input type=datetime-local>).

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const pad = (n: number) => String(n).padStart(2, '0')

interface Parts { y: number; m: number; d: number; h: number; min: number }

function parse(value: string): Parts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return null
  return { y: +match[1], m: +match[2] - 1, d: +match[3], h: +match[4], min: +match[5] }
}

function build(p: Parts): string {
  return `${p.y}-${pad(p.m + 1)}-${pad(p.d)}T${pad(p.h)}:${pad(p.min)}`
}

function dateOnly(value: string): string {
  return value ? value.slice(0, 10) : ''
}

function prettyValue(value: string): string {
  const p = parse(value)
  if (!p) return ''
  const date = new Date(p.y, p.m, p.d, p.h, p.min)
  return `${date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })} · ${date.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true })}`
}

// Monday-first leading blanks for a given month.
function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7 // shift Sun=0 → Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = Array(lead).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

/* ------------------------------------------------------------ single picker */
interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  /** Earliest selectable date (YYYY-MM-DD). Days before are disabled. */
  min?: string
  placeholder?: string
  disabled?: boolean
  /** Default hour to use when a day is picked before any time was set. */
  defaultHour?: number
}

export function DateTimePicker({
  value,
  onChange,
  min,
  placeholder = 'Pick a date & time',
  disabled = false,
  defaultHour = 18,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [above, setAbove] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const parts = parse(value)
  const today = new Date()
  const [cursor, setCursor] = useState(() => ({
    year: parts?.y ?? today.getFullYear(),
    month: parts?.m ?? today.getMonth(),
  }))

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  // Flip the panel above the trigger if it would overflow the viewport.
  useLayoutEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setAbove(window.innerHeight - rect.bottom < 430)
    }
  }, [open])

  const grid = buildMonthGrid(cursor.year, cursor.month)
  // `min` may be a date (YYYY-MM-DD) or a full datetime. Days before the min day
  // are disabled; on the min day itself, times before the min time are disabled.
  const minParts = min ? parse(min.includes('T') ? min : `${min}T00:00`) : null
  const minStamp = minParts ? new Date(minParts.y, minParts.m, minParts.d).getTime() : null
  const minMinutes = minParts ? minParts.h * 60 + minParts.min : 0
  const dayIsMin = (p: Parts | null) => !!(p && minParts && p.y === minParts.y && p.m === minParts.m && p.d === minParts.d)
  const timePast = (h24: number, mm: number, p: Parts | null) => dayIsMin(p) && h24 * 60 + mm < minMinutes

  function pickDay(day: number) {
    const base: Parts = parts ?? { y: cursor.year, m: cursor.month, d: day, h: defaultHour, min: 0 }
    const next: Parts = { ...base, y: cursor.year, m: cursor.month, d: day }
    // On the earliest selectable day, bump a now-past time up to the first valid
    // 15-minute slot, so a picked time can never land in the past.
    if (dayIsMin(next) && next.h * 60 + next.min < minMinutes) {
      const m = Math.min(Math.ceil(minMinutes / 15) * 15, 23 * 60 + 45)
      next.h = Math.floor(m / 60)
      next.min = m % 60
    }
    onChange(build(next))
  }

  function setTime(h: number, min: number) {
    const base: Parts = parts ?? { y: cursor.year, m: cursor.month, d: today.getDate(), h, min }
    onChange(build({ ...base, h, min }))
  }

  const hour12 = parts ? (parts.h % 12 === 0 ? 12 : parts.h % 12) : 6
  const meridiem = parts ? (parts.h < 12 ? 'AM' : 'PM') : 'PM'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`flex w-full items-center gap-2.5 rounded-lg border px-4 py-3 text-left text-[14px] transition-colors disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-50 ${
          open ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/40'
        }`}
      >
        <Calendar size={16} className={value ? 'text-primary' : 'text-ink-3'} />
        <span className={value ? 'text-ink' : 'text-ink-3'}>{value ? prettyValue(value) : placeholder}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className={`absolute z-50 w-[300px] rounded-2xl border border-border bg-white p-4 shadow-xl shadow-ink/10 ${
            above ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* Month header */}
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-[14px] font-semibold text-ink">{MONTHS[cursor.month]} {cursor.year}</p>
            <div className="flex gap-1">
              <button type="button" onClick={() => setCursor(c => ({ year: c.month === 0 ? c.year - 1 : c.year, month: (c.month + 11) % 12 }))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-canvas hover:text-ink">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => setCursor(c => ({ year: c.month === 11 ? c.year + 1 : c.year, month: (c.month + 1) % 12 }))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-canvas hover:text-ink">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map(w => <span key={w} className="py-1 text-center text-[11px] font-medium text-ink-3">{w}</span>)}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((day, i) => {
              if (day === null) return <span key={`b${i}`} />
              const cellStamp = new Date(cursor.year, cursor.month, day).getTime()
              const isDisabled = minStamp !== null && cellStamp < minStamp
              const isSelected = parts && parts.y === cursor.year && parts.m === cursor.month && parts.d === day
              const isToday = today.getFullYear() === cursor.year && today.getMonth() === cursor.month && today.getDate() === day
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => pickDay(day)}
                  className={`flex h-9 items-center justify-center rounded-lg text-[13px] transition-colors ${
                    isSelected
                      ? 'bg-primary font-semibold text-dark'
                      : isDisabled
                        ? 'cursor-not-allowed text-ink-3/40'
                        : `text-ink hover:bg-primary/10 ${isToday ? 'font-semibold text-primary ring-1 ring-inset ring-primary/30' : ''}`
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Time row */}
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <Clock size={15} className="text-ink-3" />
            <select
              value={hour12}
              onChange={e => {
                const h12 = +e.target.value
                const h24 = meridiem === 'PM' ? (h12 % 12) + 12 : h12 % 12
                setTime(h24, parts?.min ?? 0)
              }}
              className="select-bare rounded-lg border border-border bg-white px-2 py-1.5 font-mono text-[13px] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                const h24 = meridiem === 'PM' ? (h % 12) + 12 : h % 12
                return <option key={h} value={h} disabled={timePast(h24, 45, parts)}>{pad(h)}</option>
              })}
            </select>
            <span className="font-mono text-ink-3">:</span>
            <select
              value={parts?.min ?? 0}
              onChange={e => setTime(parts ? parts.h : (meridiem === 'PM' ? 18 : 6), +e.target.value)}
              className="select-bare rounded-lg border border-border bg-white px-2 py-1.5 font-mono text-[13px] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {[0, 15, 30, 45].map(m => (
                <option key={m} value={m} disabled={timePast(parts ? parts.h : (meridiem === 'PM' ? 18 : 6), m, parts)}>{pad(m)}</option>
              ))}
            </select>
            <div className="ml-auto flex rounded-lg border border-border p-0.5">
              {(['AM', 'PM'] as const).map(mer => {
                const merPast = mer === 'AM' && timePast(11, 45, parts)
                return (
                <button
                  key={mer}
                  type="button"
                  disabled={merPast}
                  onClick={() => {
                    const h12 = hour12
                    const h24 = mer === 'PM' ? (h12 % 12) + 12 : h12 % 12
                    setTime(h24, parts?.min ?? 0)
                  }}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    meridiem === mer ? 'bg-primary text-dark' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  {mer}
                </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-lg bg-primary py-2 text-[13px] font-semibold text-dark transition-colors hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- range picker */
interface DateTimeRangePickerProps {
  startValue: string
  endValue: string
  onChange: (next: { start: string; end: string }) => void
  disabled?: boolean
  /** Earliest selectable day (YYYY-MM-DD). Defaults to today. */
  minDate?: string
}

export function DateTimeRangePicker({ startValue, endValue, onChange, disabled, minDate }: DateTimeRangePickerProps) {
  // Earliest a fixed-date event can start: right now — so neither a past day nor
  // a past time *today* can be picked. An explicit minDate (date only) overrides.
  const now = new Date()
  const nowLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  const startMin = minDate ? `${minDate}T00:00` : nowLocal

  function handleStart(start: string) {
    // Don't auto-fill the end - the organiser sets it themselves. Only clear a
    // previously-chosen end if it now falls before the new start.
    const end = endValue && endValue >= start ? endValue : ''
    onChange({ start, end })
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-ink-3">Starts</label>
        <DateTimePicker value={startValue} onChange={handleStart} min={startMin} disabled={disabled} placeholder="Start date & time" defaultHour={18} />
      </div>
      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-ink-3">Ends</label>
        <DateTimePicker
          value={endValue}
          onChange={end => onChange({ start: startValue, end })}
          min={startValue || startMin}
          disabled={disabled}
          placeholder="End date & time"
          defaultHour={22}
        />
      </div>
    </div>
  )
}

export default DateTimePicker
