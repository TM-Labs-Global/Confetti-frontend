'use client'
import Link from 'next/link'
import { AppLogo } from '@/features/shared-ui'



export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(0,196,204,0.12), transparent 50%)',
      }}>
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <AppLogo size={36} nameClassName="font-display font-bold text-[22px] tracking-[-0.01em] text-white" />
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-[14px] p-8">
          <h2 className="font-display font-semibold text-[20px] text-white mb-1">
            Reset password
          </h2>
          <p className="text-dark-muted text-[14px] mb-6">
            We&apos;ll send a reset link to your email.
          </p>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium text-ink-2">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-dark border border-dark-border text-white text-[14px] px-4 py-[11px] rounded-[9px] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,196,204,0.15)]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-dark font-medium text-[14px] py-[11px] rounded-[9px] hover:brightness-90 active:translate-y-px transition"
            >
              Send reset link
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-dark-muted mt-5">
          <Link href="/login" className="text-primary hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
