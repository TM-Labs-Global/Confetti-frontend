export function fmtNaira(amount) {
  if (!amount && amount !== 0) return '₦0'
  return '₦' + Number(amount).toLocaleString('en-NG')
}

export function fmtDate(dateStr) {
  if (!dateStr) return 'Date TBD'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
