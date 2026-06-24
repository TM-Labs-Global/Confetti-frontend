import LandingPage from '@/views/landing/LandingPage'

// Public marketing homepage. Logged-in users still see it; the nav offers a
// "Go to dashboard" shortcut via the auth context.
export default function RootPage() {
  return <LandingPage />
}
