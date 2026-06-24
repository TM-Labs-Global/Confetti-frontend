'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'

const DEMO = {
  organiser: { email: 'organiser@confetti.ng', password: 'password123' },
  vendor:    { email: 'vendor@confetti.ng',    password: 'password123' },
  admin:     { email: 'admin@confetti.ng',     password: 'password123' },
}

const ROLE_META = {
  organiser: { emoji: '🎉', label: 'Event Organiser', desc: "I'm planning an event" },
  vendor:    { emoji: '🛒', label: 'Vendor / Supplier', desc: "I'm offering services" },
  admin:     { emoji: '🔐', label: 'Platform Admin', desc: 'I manage the platform' },
}

const DASHBOARDS = {
  organiser: '/organiser/dashboard',
  vendor:    '/vendor/dashboard',
  admin:     '/admin/dashboard',
}

export default function LoginPage() {
  const { login } = useAuth()
  const router    = useRouter()
  const [mode, setMode]         = useState('demo')
  const [demoRole, setDemoRole] = useState('organiser')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const creds = mode === 'demo' ? DEMO[demoRole] : { email, password }
      const user = await login(creds)
      router.replace(DASHBOARDS[user.role] ?? '/organiser/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-dark font-display font-bold text-lg mx-auto mb-4">🎊</div>
          <h1 className="font-display font-bold text-[28px] text-ink">Welcome back</h1>
          <p className="text-ink-3 text-[14px] mt-1">Sign in to your Confetti account</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex gap-1 p-1 bg-canvas border border-border rounded-lg mb-5">
            {['demo', 'email'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${
                  mode === m ? 'bg-white border border-border text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
                }`}
              >
                {m === 'demo' ? 'Demo login' : 'Email & password'}
              </button>
            ))}
          </div>

          {mode === 'demo' && (
            <div className="space-y-2 mb-5">
              {Object.entries(ROLE_META).map(([role, meta]) => (
                <button
                  key={role}
                  onClick={() => setDemoRole(role)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    demoRole === role
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <div>
                    <p className="font-medium text-ink text-[14px]">{meta.label}</p>
                    <p className="text-ink-3 text-[12px]">{meta.desc}</p>
                  </div>
                  {demoRole === role && (
                    <svg className="ml-auto text-primary shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                      <polyline points="5 8 7 10 11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {mode === 'email' && (
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[13px] font-medium text-ink-2 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium text-ink-2">Password</label>
                  <Link href="/forgot-password" className="text-[12px] text-primary hover:underline">Forgot?</Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-primary text-dark font-semibold text-[14px] rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : mode === 'demo' ? `Continue as ${ROLE_META[demoRole].label}` : 'Sign in'}
          </button>
        </div>

        <p className="text-center text-[13px] text-ink-3 mt-5">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
