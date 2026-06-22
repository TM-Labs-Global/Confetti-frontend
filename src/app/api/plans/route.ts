import prisma from '@/shared/lib/prisma'
import { getAuthUser, unauthorized, forbidden, badRequest } from '@/shared/lib/auth'
import { nanoid } from './shareCode'

export async function GET(request: Request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const where = auth.role === 'admin' ? {} : { organiserId: auth.id }

  const plans = await prisma.plan.findMany({
    where,
    include: {
      eventType: { select: { id: true, name: true } },
      categories: { orderBy: { allocation: 'desc' } },
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

export async function POST(request: Request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()
  if (auth.role !== 'organiser') return forbidden()

  const body = await request.json()
  const { name, eventTypeId, date, dateFlexible, state, city, totalBudget, categories, status = 'draft' } = body

  if (!name || !eventTypeId || !state || !totalBudget || !categories?.length) {
    return badRequest('Missing required fields')
  }

  const shareCode = `${eventTypeId.slice(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-5)}`

  const plan = await prisma.plan.create({
    data: {
      name,
      eventTypeId,
      status,
      date: date ? new Date(date) : null,
      dateFlexible: !!dateFlexible,
      state,
      city: city || '',
      totalBudget: Number(totalBudget),
      shareCode,
      organiserId: auth.id,
      categories: {
        create: categories.map((c: { id: string; name: string; allocation?: number | string }) => ({
          categoryId: c.id,
          name: c.name,
          allocation: Number(c.allocation) || 0,
        })),
      },
    },
    include: {
      eventType: { select: { id: true, name: true } },
      categories: { orderBy: { allocation: 'desc' } },
    },
  })

  if (status === 'open') {
    const vendors = await prisma.user.findMany({ where: { role: 'vendor' }, select: { id: true } })
    if (vendors.length > 0) {
      await prisma.notification.createMany({
        data: vendors.map(v => ({
          userId: v.id,
          type: 'new_plan',
          message: `A new ${plan.eventType?.name ?? ''} plan is open for bidding in ${state}`,
        })),
      })
    }
  }

  return Response.json({ plan }, { status: 201 })
}
