import prisma from '@/shared/lib/prisma'
import { getAuthUser, unauthorized } from '@/shared/lib/auth'

export async function GET(request: Request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return Response.json({ notifications })
}

export async function PUT(request: Request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const body = await request.json().catch(() => ({}))

  if (body.id) {
    await prisma.notification.update({ where: { id: body.id, userId: auth.id }, data: { isRead: true } })
  } else {
    await prisma.notification.updateMany({ where: { userId: auth.id, isRead: false }, data: { isRead: true } })
  }

  return Response.json({ ok: true })
}
