'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { RegisterPayload } from '@/features/auth/types/auth.types'
import { AppLogo, PasswordInput } from '@/features/shared-ui'
import { isPasswordValid } from '@/shared/utils/password'
import { CalendarDays, Store } from 'lucide-react'

const ROLE_META = {
  organiser: { icon: CalendarDays, label: 'Event Organiser', desc: "I'm planning an event", color: 'text-primary' },
  vendor: { icon: Store, label: 'Vendor / Supplier', desc: "I'm offering services", color: 'text-warning' },
} as const

type Role = keyof typeof ROLE_META

export default function SignupPage() {
  const { register } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState<RegisterPayload>({ name: '', email: '', password: '', role: 'organiser' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pre-select role from the homepage CTA (?role=organiser | vendor).
  useEffect(() => {
    const r = params.get('role')
    if (r === 'organiser' || r === 'vendor') setForm(f => ({ ...f, role: r }))
  }, [params])

  function update<K extends keyof RegisterPayload>(k: K, v: RegisterPayload[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return setError('All fields are required')
    if (!isPasswordValid(form.password)) {
      return setError('Password must be at least 8 characters with an uppercase letter, a lowercase letter, and a number')
    }
    setError('')
    setLoading(true)
    try {
      await register(form)
      // Account created & logged in; prompt email verification next.
      router.replace('/verify-email')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex justify-center" aria-label="Confette home">
            <AppLogo size={48} showName={false} />
          </Link>
          <h1 className="font-display text-[28px] font-bold text-ink">Create your account</h1>
          <p className="mt-1 text-[14px] text-ink-3">Join Confette, Nigeria&apos;s event planning marketplace</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="mb-2 text-[13px] font-medium text-ink-2">I am a…</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([role, meta]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => update('role', role)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all ${
                    form.role === role
                      ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className={`${meta.color} shrink-0`}>
                    <meta.icon size={22} strokeWidth={1.75} />
                  </span>
                  <p className="text-[13px] font-medium text-ink">{meta.label}</p>
                  <p className="text-[11px] text-ink-3">{meta.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-ink-2">Full name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Adaeze Okonkwo"
                autoComplete="name"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-[14px] text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink-2">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-border px-4 py-3 text-[14px] text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <PasswordInput
              value={form.password}
              onChange={v => update('password', v)}
              placeholder="Create a strong password"
              autoComplete="new-password"
              showStrength
              required
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !form.name.trim() || !form.email.trim() || !isPasswordValid(form.password)}
              className="w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-ink-3">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
