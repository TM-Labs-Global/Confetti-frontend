'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  /** When true, a typed value that isn't in `options` can be selected as-is
   * (offers a "Use '<query>'" row). Handy for near-complete lists like banks. */
  allowCustom?: boolean
}

/**
 * Accessible, searchable single-select combobox. Filters the list as you type,
 * supports arrow-key navigation, and closes on outside click / Escape.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  disabled = false,
  allowCustom = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  )

  // For allowCustom lists: offer the typed value when it isn't already an option.
  const trimmed = query.trim()
  const hasExact = options.some(o => o.toLowerCase() === trimmed.toLowerCase())
  const showCustom = allowCustom && trimmed.length > 0 && !hasExact

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(Math.max(0, options.indexOf(value)))
      // Focus the search box once the panel paints.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open, options, value])

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.children[active] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function choose(opt: string) {
    onChange(opt)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) choose(filtered[active]); else if (showCustom) choose(trimmed) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-[14px] transition-colors disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-50 ${
          open ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/40'
        }`}
      >
        <span className={value ? 'text-ink' : 'text-ink-3'}>{value || placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-ink/10">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setActive(0) }}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <ul ref={listRef} className="max-h-[240px] overflow-y-auto p-1.5">
            {filtered.length === 0 && !showCustom ? (
              <li className="px-3 py-6 text-center text-[13px] text-ink-3">No matches</li>
            ) : (
              <>
                {filtered.map((opt, i) => {
                  const isSelected = opt === value
                  const isActive = i === active
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => choose(opt)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                          isActive ? 'bg-primary/10 text-ink' : 'text-ink-2'
                        }`}
                      >
                        {opt}
                        {isSelected && <Check size={15} className="text-primary" />}
                      </button>
                    </li>
                  )
                })}
                {showCustom && (
                  <li>
                    <button
                      type="button"
                      onClick={() => choose(trimmed)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-primary transition-colors hover:bg-primary/10"
                    >
                      Use &ldquo;{trimmed}&rdquo;
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
