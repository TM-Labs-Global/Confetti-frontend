import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken, setCookieHeader, badRequest } from '@/lib/auth'

export async function POST(request) {
  const { email, password } = await request.json()
  if (!email || !password) return badRequest('Email and password are required')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return Response.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await signToken({ id: user.id, role: user.role })
  const { password: _, ...safeUser } = user

  return Response.json({ user: safeUser }, {
    headers: { 'Set-Cookie': setCookieHeader(token) },
  })
}
