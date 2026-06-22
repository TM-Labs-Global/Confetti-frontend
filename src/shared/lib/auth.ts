import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'confetti-dev-secret-change-in-production-please'
)

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: Request | NextRequest): string | null {
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)confetti_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export interface AuthPayload extends JWTPayload {
  id: string
  email: string
  role: 'organiser' | 'vendor' | 'admin'
}

export async function getAuthUser(request: Request | NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token) as Promise<AuthPayload | null>
}

export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status })
}

export function unauthorized(): Response {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden(): Response {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}

export function notFound(msg = 'Not found'): Response {
  return Response.json({ error: msg }, { status: 404 })
}

export function badRequest(msg = 'Bad request'): Response {
  return Response.json({ error: msg }, { status: 400 })
}

export function setCookieHeader(token: string): string {
  const maxAge = 60 * 60 * 24 * 7
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `confetti_token=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/${secure}`
}

export function clearCookieHeader(): string {
  return 'confetti_token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/'
}
