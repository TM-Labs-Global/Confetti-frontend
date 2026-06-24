'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppLogo, PasswordInput } from '@/features/shared-ui'
import { resetPassword } from '@/features/auth/services/authService'
import { isPasswordValid } from '@/shared/utils/password'
import { CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isPasswordValid(password)) {
      return setError('Password must be at least 8 characters with an uppercase letter, a lowercase letter, and a number')
    }
    if (password !== confirm) return setError('Passwords do not match')
    setError('')
    setLoading(true)
    try {
      await resetPassword(token!, password)
      setDone(true)
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
          <h1 className="font-display text-[28px] font-bold text-ink">Set a new password</h1>
          <p className="mt-1 text-[14px] text-ink-3">Choose a strong password for your account</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          {!token ? (
            <p className="text-center text-[14px] text-ink-2">
              This reset link is missing or invalid. Please{' '}
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">request a new one</Link>.
            </p>
          ) : done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 text-success" size={48} />
              <h2 className="font-display text-[20px] font-bold text-ink">Password updated</h2>
              <p className="mt-2 text-[14px] text-ink-2">You can now sign in with your new password.</p>
              <Link
                href="/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                label="New password"
                value={password}
                onChange={setPassword}
                placeholder="Create a strong password"
                autoComplete="new-password"
                showStrength
                required
              />
              <PasswordInput
                label="Confirm password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || !isPasswordValid(password) || password !== confirm}
                className="w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update password'}
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
