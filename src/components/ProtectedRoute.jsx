import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_DASHBOARDS = {
  organiser: '/organiser/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin/dashboard',
}

export default function ProtectedRoute({ requiredRole }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={ROLE_DASHBOARDS[user.role] ?? '/login'} replace />
  }

  return <Outlet />
}
