import { Suspense } from 'react'
import PlanSummaryPage from '@/pages/organizer/PlanSummaryPage'

export default function Page() {
  return (
    <Suspense>
      <PlanSummaryPage />
    </Suspense>
  )
}
