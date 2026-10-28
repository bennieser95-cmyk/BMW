import { randomBytes } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

function createContentSecurityPolicy(nonce: string): string {
  const productionDirective =
    process.env.NODE_ENV === 'production' ? '; upgrade-insecure-requests' : ''

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ') + productionDirective
}

function setSecurityHeaders(response: NextResponse, contentSecurityPolicy: string): NextResponse {
  response.headers.set('Content-Security-Policy', contentSecurityPolicy)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  return response
}

export function proxy(request: NextRequest): NextResponse {
  const nonce = randomBytes(16).toString('base64')
  const contentSecurityPolicy = createContentSecurityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy)

  const requestWithNonce = new NextRequest(request, { headers: requestHeaders })
  const pathname = request.nextUrl.pathname
  const bypassLocaleRouting = pathname.startsWith('/api/') || pathname.startsWith('/auth/')
  const response = bypassLocaleRouting
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : intlMiddleware(requestWithNonce)

  return setSecurityHeaders(response, contentSecurityPolicy)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
