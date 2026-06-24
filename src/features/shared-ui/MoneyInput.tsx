'use client'
import React from 'react'
import { formatMoneyInput, parseMoneyInput } from '@/shared/utils/format'

interface MoneyInputProps {
  /** Plain integer string, e.g. "30000". */
  value: string | number
  /** Receives the plain integer string (no separators), e.g. "30000". */
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Right-align the figure (recommended for money). Defaults to true. */
  alignRight?: boolean
  className?: string
  id?: string
  'aria-label'?: string
}

/**
 * Money-only input. Renders a ₦ prefix, formats with thousands separators as
 * the user types, rejects decimals and non-digits, and has no number-spinner
 * arrows (it is a text input with a numeric keypad hint).
 */
export function MoneyInput({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  alignRight = true,
  className = '',
  id,
  ...rest
}: MoneyInputProps) {
  const display = formatMoneyInput(String(value ?? ''))

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none font-mono text-[14px] text-ink-3">
        ₦
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        disabled={disabled}
        placeholder={placeholder}
        onChange={e => onChange(parseMoneyInput(e.target.value))}
        onKeyDown={e => {
          // Block the decimal point and exponent characters outright.
          if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
        }}
        className={`w-full rounded-lg border border-border bg-white py-3 pl-8 pr-4 font-mono text-[14px] tabular-nums text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:bg-canvas disabled:opacity-50 ${alignRight ? 'text-right' : ''} ${className}`}
        aria-label={rest['aria-label']}
      />
    </div>
  )
}

export default MoneyInput
