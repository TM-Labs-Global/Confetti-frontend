'use client'
import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { resendVerification } from '../services/authService'

// Shown in place of the portal until the signed-in user verifies their email.
export function VerifyEmailGate({ email }: { email: string }) {
  const { logout, refresh } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function resend() {
    setSending(true); setError(null)
    try {
      await resendVerification()
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend right now. Try again shortly.')
    } finally {
      setSending(false)
    }
  }

  async function iVerified() {
    setChecking(true); setError(null)
    try {
      await refresh() // if verified, the gate unmounts and the portal renders
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[440px] bg-white border border-border rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck size={26} />
        </div>
        <h1 className="font-display font-bold text-[22px] text-ink">Verify your email</h1>
        <p className="text-ink-2 text-[14px] mt-2 leading-relaxed">
          We sent a verification link to <span className="font-medium text-ink">{email}</span>.
          Click it to activate your account, then come back here.
        </p>

        {sent && <p className="mt-4 text-[13px] text-[#166534] bg-success/10 rounded-lg px-3 py-2">Verification email sent. Check your inbox (and spam).</p>}
        {error && <p className="mt-4 text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="mt-6 flex flex-col gap-2.5">
          <button onClick={iVerified} disabled={checking}
            className="w-full py-3 bg-primary text-dark text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
            {checking ? 'Checking…' : "I've verified - continue"}
          </button>
          <button onClick={resend} disabled={sending}
            className="w-full py-2.5 border border-border text-ink-2 text-[13px] font-medium rounded-xl hover:bg-canvas transition-colors disabled:opacity-50">
            {sending ? 'Sending…' : 'Resend verification email'}
          </button>
        </div>

        <button onClick={() => logout()} className="mt-5 text-[13px] text-ink-3 hover:text-ink transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}

export default VerifyEmailGate
