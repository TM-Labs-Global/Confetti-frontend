'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { AppLogo } from '@/features/shared-ui'
import { forgotPassword } from '@/features/auth/services/authService'
import { MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
    } catch {
      /* response is intentionally uniform; ignore errors */
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex justify-center" aria-label="Confette home">
            <AppLogo size={48} showName={false} />
          </Link>
          <h1 className="font-display text-[28px] font-bold text-ink">Reset password</h1>
          <p className="mt-1 text-[14px] text-ink-3">We&apos;ll email you a link to set a new one</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          {sent ? (
            <div className="text-center">
              <MailCheck className="mx-auto mb-4 text-primary" size={48} />
              <h2 className="font-display text-[20px] font-bold text-ink">Check your inbox</h2>
              <p className="mt-2 text-[14px] text-ink-2">
                If an account exists for <span className="font-medium text-ink">{email}</span>, we&apos;ve sent a
                password-reset link. It&apos;s valid for 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink-2">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-border px-4 py-3 text-[14px] text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-[13px] text-ink-3">
          <Link href="/login" className="font-medium text-primary hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
