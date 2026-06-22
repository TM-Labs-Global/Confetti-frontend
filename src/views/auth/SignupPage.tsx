'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { RegisterPayload } from '@/features/auth/types/auth.types'
import { AppLogo } from '@/features/shared-ui'
import { CalendarDays, Store } from 'lucide-react'

const ROLE_META = {
  organiser: { icon: CalendarDays, label: 'Event Organiser',   desc: "I'm planning an event", color: 'text-primary' },
  vendor:    { icon: Store,        label: 'Vendor / Supplier', desc: "I'm offering services", color: 'text-warning' },
}

const DASHBOARDS = { organiser: '/organiser/dashboard', vendor: '/vendor/dashboard' }

export default function SignupPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm]     = useState<RegisterPayload>({ name: '', email: '', password: '', role: 'organiser' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function update(k: keyof RegisterPayload, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return setError('All fields are required')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      router.replace(DASHBOARDS[user.role as keyof typeof DASHBOARDS] ?? '/organiser/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AppLogo size={48} showName={false} />
          </div>
          <h1 className="font-display font-bold text-[28px] text-ink">Create your account</h1>
          <p className="text-ink-3 text-[14px] mt-1">Join Confetti — Nigeria's event planning marketplace</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[13px] font-medium text-ink-2 mb-2">I am a…</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_META).map(([role, meta]) => (
                <button
                  key={role}
                  onClick={() => update('role', role)}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center transition-all ${
                    form.role === role
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className={`${meta.color} shrink-0`}>
                    <meta.icon size={22} strokeWidth={1.75} />
                  </span>
                  <p className="font-medium text-ink text-[13px]">{meta.label}</p>
                  <p className="text-ink-3 text-[11px]">{meta.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-2 mb-1.5">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Adaeze Okonkwo"
                required
                className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-2 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-2 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-dark font-semibold text-[14px] rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-ink-3 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
