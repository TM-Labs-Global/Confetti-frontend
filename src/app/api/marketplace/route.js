import prisma from '@/lib/prisma'
import { getAuthUser, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const { searchParams } = new URL(request.url)
  const eventType = searchParams.get('eventType')
  const state = searchParams.get('state')

  const plans = await prisma.plan.findMany({
    where: {
      status: { in: ['open', 'bidding'] },
      ...(eventType && { eventTypeId: eventType }),
      ...(state && { state }),
    },
    include: {
      eventType: { select: { id: true, name: true } },
      categories: { orderBy: { allocation: 'desc' } },
      organiser: { select: { name: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({
    plans: plans.map(p => ({
      ...p,
      bidCount: p._count.bids,
      _count: undefined,
    })),
  })
}
