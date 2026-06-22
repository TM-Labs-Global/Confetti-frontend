import prisma from '@/shared/lib/prisma'
import { getAuthUser, unauthorized, forbidden, badRequest } from '@/shared/lib/auth'

export async function GET(request: Request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()
  if (auth.role !== 'vendor') return forbidden()

  const bids = await prisma.bid.findMany({
    where: { vendorId: auth.id },
    include: {
      plan: {
        include: { eventType: { select: { id: true, name: true } } },
      },
      planCategory: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ bids })
}

export async function POST(request: Request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()
  if (auth.role !== 'vendor') return forbidden()

  const { planId, planCategoryId, amount, pitch, isCounterBid = false, counterReason } = await request.json()
  if (!planId || !planCategoryId || !amount) return badRequest('planId, planCategoryId, and amount are required')

  const plan = await prisma.plan.findUnique({ where: { id: planId } })
  if (!plan || !['open', 'bidding'].includes(plan.status)) {
    return Response.json({ error: 'Plan is not accepting bids' }, { status: 409 })
  }

  const existing = await prisma.bid.findFirst({ where: { planId, planCategoryId, vendorId: auth.id } })
  if (existing) return Response.json({ error: 'You already have a bid for this category' }, { status: 409 })

  const bid = await prisma.bid.create({
    data: {
      planId,
      planCategoryId,
      vendorId: auth.id,
      amount: Number(amount),
      pitch: pitch || '',
      isCounterBid,
      counterReason: isCounterBid ? counterReason : null,
    },
    include: { planCategory: true },
  })

  // Notify organiser
  const vendor = await prisma.user.findUnique({ where: { id: auth.id }, select: { name: true } })
  const vendorName = vendor?.name ?? 'A vendor'
  await prisma.notification.create({
    data: {
      userId: plan.organiserId,
      type: 'bid_received',
      message: `${vendorName} placed a bid on ${bid.planCategory.name} for ${plan.name}`,
    },
  })

  // Move plan to bidding status if it was open
  if (plan.status === 'open') {
    await prisma.plan.update({ where: { id: planId }, data: { status: 'bidding' } })
  }

  return Response.json({ bid }, { status: 201 })
}
