import { Suspense } from 'react'
import SignupPage from '@/views/auth/SignupPage'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignupPage />
    </Suspense>
  )
}
