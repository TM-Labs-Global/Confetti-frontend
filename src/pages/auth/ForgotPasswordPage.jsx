import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-navy">
            Confetti <span className="text-brand-gold">✦</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Reset your password</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-pink text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition text-sm"
          >
            Send reset link
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Remembered it?{' '}
          <Link to="/login" className="text-brand-pink font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
