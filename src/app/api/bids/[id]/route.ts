import prisma from '@/shared/lib/prisma'
import { getAuthUser, unauthorized, forbidden, notFound, badRequest } from '@/shared/lib/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const bid = await prisma.bid.findUnique({
    where: { id },
    include: { plan: true, planCategory: true, vendor: { select: { name: true } } },
  })
  if (!bid) return notFound('Bid not found')

  const body = await request.json()

  // Vendor updating their own bid
  if (auth.role === 'vendor') {
    if (bid.vendorId !== auth.id) return forbidden()
    if (!bid.canUpdate) return Response.json({ error: 'This bid can no longer be updated' }, { status: 409 })

    const { amount, pitch } = body
    const updated = await prisma.bid.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(pitch !== undefined && { pitch }),
      },
    })
    return Response.json({ bid: updated })
  }

  // Organiser accepting/rejecting
  if (auth.role === 'organiser') {
    if (bid.plan.organiserId !== auth.id) return forbidden()

    const { status } = body
    if (!['accepted', 'rejected'].includes(status)) return badRequest('Status must be accepted or rejected')

    const updated = await prisma.bid.update({
      where: { id },
      data: { status, canUpdate: false },
    })

    await prisma.notification.create({
      data: {
        userId: bid.vendorId,
        type: 'bid_accepted',
        message: `Your bid on ${bid.planCategory.name} for ${bid.plan.name} was ${status}`,
      },
    })

    return Response.json({ bid: updated })
  }

  return forbidden()
}
