import { clearCookieHeader } from '@/shared/lib/auth'

export async function POST() {
  return Response.json({ ok: true }, {
    headers: { 'Set-Cookie': clearCookieHeader() },
  })
}
