import prisma from '@/shared/lib/prisma'
import { getAuthUser, unauthorized, notFound } from '@/shared/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const { id } = await params

  const plan = await prisma.plan.findUnique({
    where: { id, status: { in: ['open', 'bidding'] } },
    include: {
      eventType: { select: { id: true, name: true } },
      categories: {
        orderBy: { allocation: 'desc' },
        include: {
          bids: {
            where: { vendorId: auth.id },
            select: { id: true, amount: true, status: true, pitch: true, canUpdate: true },
          },
        },
      },
      _count: { select: { bids: true } },
    },
  })

  if (!plan) return notFound('Plan not found')

  return Response.json({
    plan: {
      ...plan,
      bidCount: plan._count.bids,
      _count: undefined,
    },
  })
}
