import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_REDIRECTS = {
  organiser: '/organiser/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin/dashboard',
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('organiser')

  if (user) return <Navigate to={ROLE_REDIRECTS[user.role] ?? '/'} replace />

  function handleSubmit(e) {
    e.preventDefault()
    login(role)
    navigate(ROLE_REDIRECTS[role])
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-navy">
            Confetti <span className="text-brand-gold">✦</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              defaultValue="demo@confetti.ng"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              defaultValue="password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sign in as{' '}
              <span className="text-xs font-normal text-gray-400">(demo — pick a role)</span>
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink bg-white"
            >
              <option value="organiser">Organiser</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-brand-pink hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-pink text-white font-semibold py-2.5 rounded-lg hover:opacity-90 active:scale-[0.99] transition text-sm"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-brand-pink font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
