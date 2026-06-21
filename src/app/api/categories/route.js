import prisma from '@/lib/prisma'
import { getAuthUser, unauthorized, forbidden, badRequest } from '@/lib/auth'

export async function GET(request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const eventTypes = await prisma.eventType.findMany({
    include: { categories: { orderBy: { defaultPct: 'desc' } } },
    orderBy: { id: 'asc' },
  })

  return Response.json({ eventTypes })
}

export async function POST(request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()
  if (auth.role !== 'admin') return forbidden()

  const body = await request.json()
  const { type, eventTypeId, name, description, defaultPct, id } = body

  if (type === 'event_type') {
    if (!id || !name) return badRequest('id and name are required')
    const et = await prisma.eventType.create({ data: { id, name, description: description || '' } })
    return Response.json({ eventType: et }, { status: 201 })
  }

  if (type === 'category') {
    if (!id || !eventTypeId || !name) return badRequest('id, eventTypeId, and name are required')
    const cat = await prisma.category.create({
      data: { id, eventTypeId, name, description: description || '', defaultPct: Number(defaultPct) || 0 },
    })
    return Response.json({ category: cat }, { status: 201 })
  }

  return badRequest('type must be event_type or category')
}

export async function PUT(request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()
  if (auth.role !== 'admin') return forbidden()

  const body = await request.json()
  const { type, id, name, description, defaultPct } = body

  if (type === 'event_type') {
    const et = await prisma.eventType.update({
      where: { id },
      data: { name, ...(description !== undefined && { description }) },
    })
    return Response.json({ eventType: et })
  }

  if (type === 'category') {
    const cat = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(defaultPct !== undefined && { defaultPct: Number(defaultPct) }),
      },
    })
    return Response.json({ category: cat })
  }

  return badRequest('type must be event_type or category')
}

export async function DELETE(request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()
  if (auth.role !== 'admin') return forbidden()

  const { type, id } = await request.json()

  if (type === 'event_type') {
    await prisma.eventType.delete({ where: { id } })
  } else if (type === 'category') {
    await prisma.category.delete({ where: { id } })
  } else {
    return badRequest('type must be event_type or category')
  }

  return Response.json({ ok: true })
}
