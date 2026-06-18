import { useParams } from 'react-router-dom'

export default function PlanDetailPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
      <h1 className="text-3xl font-bold text-brand-navy">Plan Detail</h1>
      <p className="text-gray-400 text-sm">Plan ID: {id}</p>
    </div>
  )
}
