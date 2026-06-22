'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/AuthContext'

const DASHBOARDS = {
  organiser: '/organiser/dashboard',
  vendor:    '/vendor/dashboard',
  admin:     '/admin/dashboard',
}

export default function RootPage() {
  const { user } = useAuth()
  const router   = useRouter()

  useEffect(() => {
    router.replace(user ? (DASHBOARDS[user.role] ?? '/login') : '/login')
  }, [user, router])

  return null
}
