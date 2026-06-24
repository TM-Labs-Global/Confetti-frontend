'use client'
import { useState, useEffect } from 'react'
import type { AppNotification } from '../types/notification.types'
import { fetchNotifications, markAllRead, markOneRead } from '../services/notificationService'

export function useNotifications() {
  const [notifs, setNotifs] = useState<AppNotification[]>([])

  useEffect(() => {
    fetchNotifications().then(setNotifs)
  }, [])

  const unread = notifs.filter(n => !n.isRead).length

  async function markAll(): Promise<void> {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllRead()
  }

  async function markOne(id: string): Promise<void> {
    setNotifs(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)))
    await markOneRead(id)
  }

  return { notifs, unread, markAll, markOne }
}
