import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'confetti-dev-secret-change-in-production-please'
)

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request) {
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)confetti_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function getAuthUser(request) {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export function json(data, status = 200) {
  return Response.json(data, { status })
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden() {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}

export function notFound(msg = 'Not found') {
  return Response.json({ error: msg }, { status: 404 })
}

export function badRequest(msg = 'Bad request') {
  return Response.json({ error: msg }, { status: 400 })
}

export function setCookieHeader(token) {
  const maxAge = 60 * 60 * 24 * 7
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `confetti_token=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/${secure}`
}

export function clearCookieHeader() {
  return 'confetti_token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/'
}
