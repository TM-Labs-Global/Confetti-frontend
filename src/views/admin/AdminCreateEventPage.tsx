'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import CreatePlanPage from '@/views/organizer/CreatePlanPage'

// Admins run the platform's own events as an event-management company. This
// reuses the organiser create wizard verbatim — the surface="admin" prop only
// changes the draft key and where it returns to. The wizard is built on the
// light design tokens (bg-white / text-ink / border-border), which is exactly
// what the (now single-theme, light) admin portal uses. No wizard markup changes.
export default function AdminCreateEventPage() {
  const isEdit = !!useSearchParams().get('edit')

  return (
    <div className="max-w-[680px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-dark-muted mb-6">
        <Link href="/admin/plans" className="hover:text-white transition-colors">All Events</Link>
        <span>/</span>
        <span className="text-white">{isEdit ? 'Edit event' : 'New event'}</span>
      </div>
      {!isEdit && (
        <p className="mb-7 rounded-lg border border-primary/30 bg-primary/[0.06] px-4 py-2.5 text-[13px] text-[#7CE0FF]">
          This is a platform-run event. Vendors will see it listed by Confette Events.
        </p>
      )}
      <CreatePlanPage surface="admin" />
    </div>
  )
}
