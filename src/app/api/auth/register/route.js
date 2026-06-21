import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken, setCookieHeader, badRequest } from '@/lib/auth'

export async function POST(request) {
  const { name, email, password, role = 'organiser' } = await request.json()

  if (!name || !email || !password) return badRequest('Name, email, and password are required')
  if (!['organiser', 'vendor'].includes(role)) return badRequest('Role must be organiser or vendor')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'Email already in use' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const token = await signToken({ id: user.id, role: user.role })

  return Response.json({ user }, {
    status: 201,
    headers: { 'Set-Cookie': setCookieHeader(token) },
  })
}
