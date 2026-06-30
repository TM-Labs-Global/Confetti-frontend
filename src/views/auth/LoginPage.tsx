'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { resolveDashboard } from '@/features/auth/portal'
import { AppLogo, PasswordInput } from '@/features/shared-ui'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Read straight from the form so browser-autofilled values are captured even
    // if React's onChange hasn't fired yet (avoids the "click twice" issue).
    const fd = new FormData(e.currentTarget)
    const emailVal = ((fd.get('email') as string) ?? email).trim()
    const passwordVal = (fd.get('password') as string) ?? password
    if (!emailVal || !passwordVal) return setError('Email and password are required')
    setEmail(emailVal)
    setPassword(passwordVal)
    setError('')
    setLoading(true)
    try {
      const user = await login({ email: emailVal, password: passwordVal })
      router.replace(resolveDashboard(user))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex justify-center" aria-label="Confette home">
            <AppLogo size={48} showName={false} />
          </Link>
          <h1 className="font-display text-[28px] font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-[14px] text-ink-3">Sign in to your Confette account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink-2">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-[14px] text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-2">Password</span>
                <Link href="/forgot-password" className="text-[12px] text-primary hover:underline">Forgot?</Link>
              </div>
              <PasswordInput
                label=""
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-ink-3">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
