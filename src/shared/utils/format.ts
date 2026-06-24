export function fmtNaira(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return '₦0'
  return '₦' + Number(amount).toLocaleString('en-NG')
}

export function fmtDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'Date TBD'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function fmtTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-NG', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export function fmtDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'Date TBD'
  return `${fmtDate(dateStr)}, ${fmtTime(dateStr)}`
}

/**
 * Human-friendly event window. Collapses a same-day range to one date with a
 * time span, and falls back gracefully when a plan has a flexible date.
 */
export function fmtDateRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  flexible?: boolean,
): string {
  if (flexible) return 'Date to be confirmed'
  if (!start) return 'No date set'

  const startDate = new Date(start)
  if (!end) return fmtDateTime(startDate)

  const endDate   = new Date(end)
  const sameDay   = startDate.toDateString() === endDate.toDateString()
  if (sameDay) return `${fmtDate(startDate)}, ${fmtTime(startDate)} – ${fmtTime(endDate)}`
  return `${fmtDateTime(startDate)} – ${fmtDateTime(endDate)}`
}

/**
 * Format a number string with thousands separators for a money input.
 * Strips everything but digits (no decimals, money is whole naira) and never
 * shows a leading zero. Returns '' for empty/zero input.
 */
export function formatMoneyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-NG')
}

/** Strip separators from a formatted money string back to a plain integer string. */
export function parseMoneyInput(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

export function timeAgo(isoString: string | Date): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
