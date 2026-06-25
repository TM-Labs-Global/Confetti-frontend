'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/auth/context/AuthContext'
import { AppLogo, ConfettiBurst } from '@/features/shared-ui'
import { verifyEmail, resendVerification } from '@/features/auth/services/authService'
import { MailCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const DASHBOARDS: Record<string, string> = {
  organiser: '/organiser/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin/dashboard',
}

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const token = params.get('token')
  const { user } = useAuth()

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(token ? 'verifying' : 'idle')
  const [message, setMessage] = useState('')
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) return
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error')
        setMessage((err as Error).message)
      })
  }, [token])

  async function handleResend() {
    setResending(true)
    try {
      await resendVerification()
      setResent(true)
    } catch {
      /* ignore - keep UX simple */
    } finally {
      setResending(false)
    }
  }

  const dashboard = user ? DASHBOARDS[user.role] ?? '/login' : '/login'

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex justify-center" aria-label="Confette home">
            <AppLogo size={48} showName={false} />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          {status === 'verifying' && (
            <>
              <Loader2 className="mx-auto mb-4 animate-spin text-primary" size={40} />
              <h1 className="font-display text-[22px] font-bold text-ink">Verifying your email…</h1>
              <p className="mt-2 text-[14px] text-ink-2">Hang tight, this only takes a second.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <ConfettiBurst variant="center" />
              <CheckCircle2 className="mx-auto mb-4 text-success" size={48} />
              <h1 className="font-display text-[22px] font-bold text-ink">Email verified 🎉</h1>
              <p className="mt-2 text-[14px] text-ink-2">Your account is all set. Welcome to the party.</p>
              <Link
                href={dashboard}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90"
              >
                {user ? 'Go to dashboard' : 'Sign in'}
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h1 className="font-display text-[22px] font-bold text-ink">Link expired or invalid</h1>
              <p className="mt-2 text-[14px] text-ink-2">{message || 'Please request a new verification link.'}</p>
              {user && (
                <button
                  onClick={handleResend}
                  disabled={resending || resent}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {resent ? 'New link sent ✓' : resending ? 'Sending…' : 'Resend verification link'}
                </button>
              )}
            </>
          )}

          {status === 'idle' && (
            <>
              <MailCheck className="mx-auto mb-4 text-primary" size={48} />
              <h1 className="font-display text-[22px] font-bold text-ink">Check your inbox</h1>
              <p className="mt-2 text-[14px] text-ink-2">
                We sent a verification link{user?.email ? <> to <span className="font-medium text-ink">{user.email}</span></> : ''}.
                Click it to confirm your email.
              </p>
              <button
                onClick={handleResend}
                disabled={resending || resent}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-border py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-canvas disabled:opacity-50"
              >
                {resent ? 'New link sent ✓' : resending ? 'Sending…' : 'Resend link'}
              </button>
              <Link
                href={dashboard}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90"
              >
                {user ? 'Continue to dashboard' : 'Back to sign in'}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
