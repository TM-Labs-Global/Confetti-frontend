import type { AppNotification } from '../types/notification.types'

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await fetch('/api/notifications')
  if (!res.ok) return []
  const data = await res.json()
  return data.notifications ?? []
}

export async function markAllRead(): Promise<void> {
  await fetch('/api/notifications', { method: 'PUT' })
}

export async function markOneRead(id: string): Promise<void> {
  await fetch('/api/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
}
