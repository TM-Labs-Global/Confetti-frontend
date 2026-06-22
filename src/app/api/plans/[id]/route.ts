import prisma from '@/shared/lib/prisma'
import { getAuthUser, unauthorized, forbidden, notFound } from '@/shared/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const { id } = await params

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      eventType: { select: { id: true, name: true } },
      categories: { orderBy: { allocation: 'desc' } },
      organiser: { select: { id: true, name: true, email: true } },
      bids: {
        include: { vendor: { select: { id: true, name: true } }, planCategory: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!plan) return notFound('Plan not found')
  if (auth.role === 'organiser' && plan.organiserId !== auth.id) return forbidden()

  return Response.json({ plan })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const plan = await prisma.plan.findUnique({ where: { id } })
  if (!plan) return notFound('Plan not found')

  if (auth.role === 'organiser' && plan.organiserId !== auth.id) return forbidden()
  if (auth.role === 'vendor') return forbidden()

  const body = await request.json()
  const { status, name, date, dateFlexible, state, city, totalBudget } = body

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(name !== undefined && { name }),
      ...(date !== undefined && { date: date ? new Date(date) : null }),
      ...(dateFlexible !== undefined && { dateFlexible }),
      ...(state !== undefined && { state }),
      ...(city !== undefined && { city }),
      ...(totalBudget !== undefined && { totalBudget: Number(totalBudget) }),
    },
    include: {
      eventType: { select: { id: true, name: true } },
      categories: { orderBy: { allocation: 'desc' } },
    },
  })

  return Response.json({ plan: updated })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const plan = await prisma.plan.findUnique({ where: { id } })
  if (!plan) return notFound('Plan not found')
  if (auth.role === 'organiser' && plan.organiserId !== auth.id) return forbidden()
  if (auth.role === 'vendor') return forbidden()
  if (plan.status !== 'draft' && auth.role !== 'admin') {
    return Response.json({ error: 'Only draft plans can be deleted' }, { status: 409 })
  }

  await prisma.plan.delete({ where: { id } })
  return Response.json({ ok: true })
}
