import CreatePlanPage from '@/views/organizer/CreatePlanPage'

// Wrap rather than re-export: a page's default export is type-checked against
// Next's PageProps, and CreatePlanPage now takes a `surface` prop (defaulting to
// organiser here) which a direct re-export would clash with.
export default function Page() {
  return <CreatePlanPage />
}
