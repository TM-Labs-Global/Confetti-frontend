import prisma from '@/lib/prisma'
import { getAuthUser, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = await getAuthUser(request)
  if (!auth) return unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  if (!user) return unauthorized()

  return Response.json({ user })
}
