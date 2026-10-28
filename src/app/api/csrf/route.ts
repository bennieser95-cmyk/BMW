import { randomBytes } from 'node:crypto'

import { json } from '@/lib/api/http'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET(): Response {
  const csrfToken = randomBytes(32).toString('hex')
  const secure = new URL(env.APP_BASE_URL).protocol === 'https:'
  const name = secure ? '__Host-bavaria.csrf' : 'bavaria.csrf'
  return json({ csrfToken }, 200, {
    'Set-Cookie': `${name}=${csrfToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600${secure ? '; Secure' : ''}`,
  })
}
