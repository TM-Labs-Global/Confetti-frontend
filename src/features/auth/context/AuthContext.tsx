'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthUser, LoginPayload, RegisterPayload, Portal } from '../types/auth.types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  /** Opt the signed-in user into the second portal (organiser or vendor). */
  addRole: (role: Portal) => Promise<AuthUser>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then((data: { user: AuthUser } | null) => setUser(data?.user ?? null))
      .finally(() => setLoading(false))
  }, [])

  async function login({ email, password }: LoginPayload): Promise<AuthUser> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Login failed')
    setUser(data.user)
    return data.user as AuthUser
  }

  async function register({ name, email, password, role }: RegisterPayload): Promise<AuthUser> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Registration failed')
    setUser(data.user)
    return data.user as AuthUser
  }

  async function addRole(role: Portal): Promise<AuthUser> {
    const res = await fetch('/api/auth/add-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Could not add that role')
    setUser(data.user)
    return data.user as AuthUser
  }

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  // Re-fetch the current user (e.g. after they verify their email) so the UI
  // updates without a full reload.
  async function refresh(): Promise<void> {
    const res = await fetch('/api/auth/me')
    const data = res.ok ? await res.json() : null
    setUser(data?.user ?? null)
  }

  // Re-validate the session when the tab regains focus or becomes visible, so a
  // status change made elsewhere (e.g. an admin suspending the account) shows up
  // promptly instead of waiting for a manual reload.
  useEffect(() => {
    function revalidate() {
      if (document.visibilityState === 'visible') void refresh()
    }
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', revalidate)
    return () => {
      window.removeEventListener('focus', revalidate)
      document.removeEventListener('visibilitychange', revalidate)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, addRole, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
