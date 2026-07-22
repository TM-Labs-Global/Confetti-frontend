import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth.types'

export async function login({ email, password }: LoginPayload): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Login failed')
  return data.user as AuthUser
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Registration failed')
  return data.user as AuthUser
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function me(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  const data = await res.json()
  return data.user as AuthUser
}

async function post(path: string, body?: unknown): Promise<void> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed')
}

export const verifyEmail = (email: string, code: string) =>
  post('/api/auth/verify-email', { email, code })
export const resendVerification = () => post('/api/auth/resend-verification')
export const forgotPassword = (email: string) => post('/api/auth/forgot-password', { email })
export const resetPassword = (token: string, password: string) =>
  post('/api/auth/reset-password', { token, password })
