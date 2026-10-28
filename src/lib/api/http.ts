import 'server-only'

import { randomUUID, timingSafeEqual } from 'node:crypto'

import { z } from 'zod'

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/shared/domain-error'
import { runWithCorrelationId } from '@/infrastructure/logging/correlation-id'
import { logger } from '@/infrastructure/logging/logger'
import { env } from '@/lib/env'
import { buildProblemDetails, createProblemResponse } from '@/lib/problem-details'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly retryAfter?: number,
  ) {
    super(code)
  }
}

export function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  const result = new Headers(headers)
  result.set('Cache-Control', 'no-store')
  return Response.json(data, { status, headers: result })
}

export function constantTimeEqual(first: string, second: string): boolean {
  const a = Buffer.from(first)
  const b = Buffer.from(second)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function assertOrigin(requestHeaders: Headers): void {
  const origin = requestHeaders.get('origin')
  if (origin !== new URL(env.APP_BASE_URL).origin) throw new ForbiddenError('INVALID_ORIGIN')
  if (requestHeaders.get('sec-fetch-site') === 'cross-site')
    throw new ForbiddenError('INVALID_ORIGIN')
}

export function assertCsrf(request: Request): void {
  assertOrigin(request.headers)
  const name =
    new URL(env.APP_BASE_URL).protocol === 'https:' ? '__Host-bavaria.csrf' : 'bavaria.csrf'
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1)
  const token = request.headers.get('x-csrf-token')
  if (!cookie || !token || !/^[a-f0-9]{64}$/.test(token) || !constantTimeEqual(cookie, token)) {
    throw new ForbiddenError('INVALID_CSRF_TOKEN')
  }
}

export async function readBody(request: Request): Promise<string> {
  if (Number(request.headers.get('content-length')) > 16384)
    throw new HttpError(413, 'BODY_TOO_LARGE')
  if (!request.body) throw new HttpError(400, 'INVALID_JSON')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 16384) {
        await reader.cancel()
        throw new HttpError(413, 'BODY_TOO_LARGE')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  return Buffer.concat(chunks).toString('utf8')
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') {
    throw new HttpError(415, 'JSON_REQUIRED')
  }
  const text = await readBody(request)
  let payload: unknown
  try {
    payload = JSON.parse(text)
  } catch {
    throw new HttpError(400, 'INVALID_JSON')
  }
  return schema.parse(payload)
}

export function parseQuery<T>(request: Request, schema: z.ZodType<T>): T {
  const query = new URL(request.url).searchParams
  if (new Set(query.keys()).size !== [...query.keys()].length)
    throw new HttpError(422, 'DUPLICATE_QUERY')
  return schema.parse(Object.fromEntries(query))
}

export function handleRoute(
  request: Request,
  operation: () => Promise<Response>,
): Promise<Response> {
  const traceId = randomUUID()
  return runWithCorrelationId(async () => {
    try {
      const response = await operation()
      response.headers.set('x-trace-id', traceId)
      return response
    } catch (error) {
      const status =
        error instanceof HttpError
          ? error.status
          : error instanceof z.ZodError || error instanceof ValidationError
            ? 422
            : error instanceof UnauthorizedError
              ? 401
              : error instanceof ForbiddenError
                ? 403
                : error instanceof NotFoundError
                  ? 404
                  : error instanceof ConflictError
                    ? 409
                    : error instanceof ServiceUnavailableError
                      ? 503
                      : 503
      const title =
        (
          {
            400: 'Invalid request',
            401: 'Authentication required',
            403: 'Request forbidden',
            404: 'Resource not found',
            409: 'Request conflicts with current state',
            413: 'Request too large',
            415: 'Unsupported media type',
            422: 'Validation failed',
            429: 'Too many requests',
            503: 'Service temporarily unavailable',
          } as Record<number, string>
        )[status] ?? 'Request failed'
      logger[status >= 500 ? 'error' : 'warn']({ event: 'request.failed', status, traceId }, title)
      const response = createProblemResponse(
        buildProblemDetails({
          title,
          status,
          traceId,
          instance: new URL(request.url).pathname,
          ...(error instanceof z.ZodError
            ? {
                errors: error.issues.map((issue) => ({
                  field: issue.path.join('.'),
                  code: issue.code,
                })),
              }
            : {}),
        }),
      )
      response.headers.set('Cache-Control', 'no-store')
      response.headers.set('x-trace-id', traceId)
      if (error instanceof HttpError && error.retryAfter)
        response.headers.set('Retry-After', String(error.retryAfter))
      return response
    }
  }, traceId)
}
