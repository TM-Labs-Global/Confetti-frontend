import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import OrganizerLayout from './layouts/OrganizerLayout'
import VendorLayout from './layouts/VendorLayout'
import AdminLayout from './layouts/AdminLayout'

import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import CreatePlanPage from './pages/organizer/CreatePlanPage'
import PlanSummaryPage from './pages/organizer/PlanSummaryPage'
import PlanDetailPage from './pages/organizer/PlanDetailPage'

import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorBidsPage from './pages/vendor/VendorBidsPage'
import VendorPlanDetailPage from './pages/vendor/VendorPlanDetailPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPlansPage from './pages/admin/AdminPlansPage'
import AdminPlanDetailPage from './pages/admin/AdminPlanDetailPage'
import AdminBidsPage from './pages/admin/AdminBidsPage'

import ProtectedRoute from './components/ProtectedRoute'

const ROLE_DASHBOARDS = {
  organiser: '/organiser/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin/dashboard',
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_DASHBOARDS[user.role] ?? '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Organiser */}
        <Route element={<ProtectedRoute requiredRole="organiser" />}>
          <Route element={<OrganizerLayout />}>
            <Route path="/organiser/dashboard" element={<OrganizerDashboard />} />
            <Route path="/organiser/create-plan" element={<CreatePlanPage />} />
            <Route path="/organiser/plans" element={<PlanSummaryPage />} />
            <Route path="/organiser/plans/:id" element={<PlanDetailPage />} />
          </Route>
        </Route>

        {/* Vendor */}
        <Route element={<ProtectedRoute requiredRole="vendor" />}>
          <Route element={<VendorLayout />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/bids" element={<VendorBidsPage />} />
            <Route path="/vendor/plans/:id" element={<VendorPlanDetailPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/plans" element={<AdminPlansPage />} />
            <Route path="/admin/plans/:id" element={<AdminPlanDetailPage />} />
            <Route path="/admin/bids" element={<AdminBidsPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
