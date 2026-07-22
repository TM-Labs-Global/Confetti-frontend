'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/AuthContext'
import { resolveDashboard } from '@/features/auth/portal'
import { AppLogo, ConfettiBurst } from '@/features/shared-ui'
import { verifyEmail, resendVerification } from '@/features/auth/services/authService'
import { MailCheck, CheckCircle2, Loader2 } from 'lucide-react'

const CODE_LEN = 6
const RESEND_COOLDOWN = 30 // seconds

// Six single-character boxes for the OTP: auto-advance on type, back up on
// backspace, and fill the lot from a pasted code. Numeric keyboard on mobile.
function OtpBoxes({ value, onChange, onComplete, disabled }: {
  value: string
  onChange: (v: string) => void
  onComplete: (v: string) => void
  disabled?: boolean
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  function setChar(i: number, char: string): string {
    const next = value.padEnd(CODE_LEN).split('')
    next[i] = char || ' '
    const joined = next.join('').replace(/\s/g, ' ').slice(0, CODE_LEN).trimEnd()
    onChange(joined)
    return joined
  }

  function handleChange(i: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit) return
    const joined = setChar(i, digit)
    if (i < CODE_LEN - 1) refs.current[i + 1]?.focus()
    if (joined.length === CODE_LEN) onComplete(joined)
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus()
      setChar(i - 1, '')
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LEN)
    if (!pasted) return
    onChange(pasted)
    refs.current[Math.min(pasted.length, CODE_LEN - 1)]?.focus()
    if (pasted.length === CODE_LEN) onComplete(pasted)
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length: CODE_LEN }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={value[i] ?? ''}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-11 rounded-xl border border-border bg-white text-center font-mono text-[24px] font-medium text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
        />
      ))}
    </div>
  )
}

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle')
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Prefill the email from the session (present right after signup).
  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])

  // Countdown ticker for the resend button.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function submit(codeToUse: string) {
    if (!email.trim()) { setError('Enter the email you signed up with.'); return }
    if (codeToUse.length !== CODE_LEN) return
    setStatus('verifying')
    setError('')
    try {
      await verifyEmail(email.trim(), codeToUse)
      // Re-fetch the session so emailVerified flips to true (and we know the
      // role) before we move them on — the email-verify gate then lets them in.
      await refresh()
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError((err as Error).message)
      setCode('')
    }
  }

  // Once verified, send them straight to their dashboard (a beat for the confetti).
  useEffect(() => {
    if (status !== 'success') return
    const dest = user ? resolveDashboard(user) : '/login'
    const t = setTimeout(() => router.replace(dest), 1600)
    return () => clearTimeout(t)
  }, [status, user, router])

  async function handleResend() {
    setResending(true)
    setError('')
    try {
      await resendVerification()
      setCode('')
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError((err as Error).message || 'Could not resend the code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const dashboard = user ? resolveDashboard(user) : '/login'

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex justify-center" aria-label="Confette home">
            <AppLogo size={48} showName={false} />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          {status === 'success' ? (
            <>
              <ConfettiBurst variant="center" />
              <CheckCircle2 className="mx-auto mb-4 text-success" size={48} />
              <h1 className="font-display text-[22px] font-bold text-ink">Email verified 🎉</h1>
              <p className="mt-2 text-[14px] text-ink-2">
                {user ? 'Your account is all set. Taking you to your dashboard…' : 'Your email is confirmed. Taking you to sign in…'}
              </p>
              <Link href={dashboard} className="mt-5 inline-flex items-center justify-center text-[13px] font-medium text-primary hover:underline">
                {user ? 'Go to dashboard now' : 'Sign in now'}
              </Link>
            </>
          ) : (
            <>
              <MailCheck className="mx-auto mb-4 text-primary" size={44} />
              <h1 className="font-display text-[22px] font-bold text-ink">Enter your code</h1>
              <p className="mt-2 text-[14px] text-ink-2">
                We sent a 6-digit code{email ? <> to <span className="font-medium text-ink">{email}</span></> : ''}. It expires in 10 minutes.
              </p>

              {!user && (
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  className="mt-5 w-full rounded-xl border border-border px-4 py-3 text-center text-[14px] text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              )}

              <div className="mt-6">
                <OtpBoxes value={code} onChange={setCode} onComplete={submit} disabled={status === 'verifying'} />
              </div>

              {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}

              <button
                onClick={() => submit(code)}
                disabled={status === 'verifying' || code.length !== CODE_LEN}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-dark transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'verifying' ? <><Loader2 className="animate-spin" size={16} /> Verifying…</> : 'Verify email'}
              </button>

              <div className="mt-5 text-[13px] text-ink-3">
                Didn&apos;t get it?{' '}
                {user ? (
                  <button
                    onClick={handleResend}
                    disabled={resending || cooldown > 0}
                    className="font-medium text-primary hover:underline disabled:text-ink-3 disabled:no-underline"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
                  </button>
                ) : (
                  <Link href="/login" className="font-medium text-primary hover:underline">Sign in to resend</Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
