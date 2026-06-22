import { Suspense } from 'react'
import PlanSummaryPage from '@/views/organizer/PlanSummaryPage'

export default function Page() {
  return (
    <Suspense>
      <PlanSummaryPage />
    </Suspense>
  )
}
