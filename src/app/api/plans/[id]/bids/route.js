import prisma from '@/lib/prisma'
import { getAuthUser, unauthorized, forbidden, notFound } from '@/lib/auth'

export async function GET(request, { params }) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const plan = await prisma.plan.findUnique({ where: { id } })
  if (!plan) return notFound('Plan not found')
  if (auth.role === 'organiser' && plan.organiserId !== auth.id) return forbidden()

  const bids = await prisma.bid.findMany({
    where: { planId: id },
    include: {
      vendor: { select: { id: true, name: true } },
      planCategory: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ bids })
}
