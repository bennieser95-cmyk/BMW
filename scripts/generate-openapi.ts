import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { leadSchema } from '../src/lib/api/lead.schema'
import {
  configurationSchema,
  dealerQuerySchema,
  deleteAccountSchema,
  idSchema,
  modelQuerySchema,
  paginationSchema,
  priceRequestSchema,
  renameConfigurationSchema,
  revalidationSchema,
  slugSchema,
} from '../src/lib/api/request.schema'
import {
  configurationResponseSchema,
  configurationsResponseSchema,
  dealersResponseSchema,
  exportResponseSchema,
  modelResponseSchema,
  modelsResponseSchema,
  optionResponseSchema,
  priceResponseSchema,
  problemResponseSchema,
} from '../src/lib/api/response.schema'

const registry = new OpenAPIRegistry()
registry.registerComponent('securitySchemes', 'session', {
  type: 'apiKey',
  in: 'cookie',
  name: '__Secure-neon-auth.session_token',
})
registry.registerComponent('securitySchemes', 'csrf', {
  type: 'apiKey',
  in: 'header',
  name: 'x-csrf-token',
})
registry.registerComponent('securitySchemes', 'cron', { type: 'http', scheme: 'bearer' })
registry.registerComponent('securitySchemes', 'webhook', {
  type: 'apiKey',
  in: 'header',
  name: 'x-revalidate-signature',
})
const errors = Object.fromEntries(
  [400, 401, 403, 404, 409, 413, 415, 422, 429, 503].map((status) => [
    status,
    {
      description: `RFC 9457 (${status}); traceId, no sensitive exception details`,
      content: { 'application/problem+json': { schema: problemResponseSchema } },
    },
  ]),
)
const session = [{ session: [] }]
const mutation = [{ session: [], csrf: [] }]
const success = (schema: z.ZodType, status = 200) => ({
  ...errors,
  [status]: {
    description: 'Success; Cache-Control: no-store; x-trace-id',
    content: { 'application/json': { schema } },
  },
})
const body = (schema: z.ZodType) => ({
  required: true,
  content: { 'application/json': { schema } },
})
const slugParams = z.object({ slug: slugSchema })
const idParams = z.object({ id: idSchema })
const deleted = z.object({ deleted: z.literal(true) })

registry.registerPath({
  method: 'get',
  path: '/api/v1/models',
  summary: 'Filtered catalog',
  request: { query: modelQuerySchema },
  responses: success(modelsResponseSchema),
})
registry.registerPath({
  method: 'get',
  path: '/api/v1/models/{slug}',
  summary: 'Model detail',
  request: { params: slugParams },
  responses: success(modelResponseSchema.extend({ currency: z.literal('EUR') })),
})
registry.registerPath({
  method: 'get',
  path: '/api/v1/models/{slug}/options',
  summary: 'Trusted options and constraints',
  request: { params: slugParams },
  responses: success(
    z.object({
      modelSlug: slugSchema,
      options: z.array(optionResponseSchema),
      currency: z.literal('EUR'),
    }),
  ),
})
registry.registerPath({
  method: 'post',
  path: '/api/v1/configurations/price',
  summary: 'Recalculate using server catalog and domain engine',
  request: { body: body(priceRequestSchema) },
  responses: success(priceResponseSchema),
})
registry.registerPath({
  method: 'get',
  path: '/api/v1/dealers',
  summary: 'Dealer search by exact five-digit postal code',
  request: { query: dealerQuerySchema },
  responses: success(dealersResponseSchema),
})
registry.registerPath({
  method: 'post',
  path: '/api/v1/leads',
  summary: 'Persist consented lead (5 requests / 10 minutes)',
  description:
    'Same-origin double-submit CSRF. Empty honeypot. Optional session supplies userId; never accepted from input.',
  security: [{ csrf: [] }],
  request: { body: body(leadSchema) },
  responses: success(z.object({ id: idSchema, createdAt: z.iso.datetime() }), 201),
})
registry.registerPath({
  method: 'get',
  path: '/api/v1/me/configurations',
  summary: 'Own configurations (verified account)',
  security: session,
  request: { query: paginationSchema.strict() },
  responses: success(configurationsResponseSchema),
})
registry.registerPath({
  method: 'post',
  path: '/api/v1/me/configurations',
  summary: 'Save configuration; maximum 20 per account',
  security: mutation,
  request: { body: body(configurationSchema) },
  responses: success(configurationResponseSchema, 201),
})
registry.registerPath({
  method: 'get',
  path: '/api/v1/me/configurations/{id}',
  summary: 'Read own configuration',
  security: session,
  request: { params: idParams },
  responses: success(configurationResponseSchema),
})
registry.registerPath({
  method: 'patch',
  path: '/api/v1/me/configurations/{id}',
  summary: 'Rename own configuration',
  security: mutation,
  request: { params: idParams, body: body(renameConfigurationSchema) },
  responses: success(configurationResponseSchema),
})
registry.registerPath({
  method: 'delete',
  path: '/api/v1/me/configurations/{id}',
  summary: 'Delete own configuration',
  security: mutation,
  request: { params: idParams },
  responses: success(deleted),
})
registry.registerPath({
  method: 'delete',
  path: '/api/v1/me',
  summary: 'Delete application data and managed identity',
  description:
    'Optional current password may be required by the identity provider. Failed identity deletion blocks writes until retry; never reports false success.',
  security: mutation,
  request: { body: { ...body(deleteAccountSchema), required: false } },
  responses: success(deleted),
})
registry.registerPath({
  method: 'get',
  path: '/api/v1/me/export',
  summary: 'Personal data export (GDPR articles 15/20)',
  security: session,
  responses: success(exportResponseSchema),
})
registry.registerPath({
  method: 'get',
  path: '/api/csrf',
  summary: 'Issue same-origin CSRF token and HttpOnly cookie',
  responses: success(z.object({ csrfToken: z.string().regex(/^[a-f0-9]{64}$/) })),
})
registry.registerPath({
  method: 'post',
  path: '/api/revalidate',
  summary: 'HMAC-authenticated cache invalidation with replay protection',
  description:
    'Signature: lowercase hex HMAC-SHA256(secret, timestamp + "." + exact raw JSON body). Timestamp: Unix seconds, tolerance +/-300 seconds. Accepted signatures are claimed persistently for 10 minutes.',
  security: [{ webhook: [] }],
  request: {
    headers: z.object({ 'x-revalidate-timestamp': z.string().regex(/^\d{10}$/) }),
    body: body(revalidationSchema),
  },
  responses: success(z.object({ revalidated: z.literal(true), tag: z.string() })),
})
registry.registerPath({
  method: 'get',
  path: '/api/health',
  summary: 'Check real database reachability (SELECT 1)',
  responses: success(z.object({ status: z.literal('ok'), database: z.literal('reachable') })),
})
registry.registerPath({
  method: 'get',
  path: '/api/cron/purge-leads',
  summary: 'Delete leads older than 90 days and expired security records',
  security: [{ cron: [] }],
  responses: success(z.object({ removed: z.number().int().nonnegative() })),
})
for (const method of ['get', 'post'] as const) {
  registry.registerPath({
    method,
    path: '/api/auth/{path}',
    summary: 'Neon Auth SDK proxy',
    description:
      'Provider-owned payloads and responses; see pinned SDK 0.7.0-beta. POST requires same origin and body <=16 KiB. Direct delete-user is forbidden; use DELETE /api/v1/me. Supports email/password, email-otp/*, password-reset and get-session.',
    request: { params: z.object({ path: z.string().min(1) }) },
    responses: {
      ...errors,
      200: { description: 'Neon Auth provider response' },
      302: { description: 'Provider callback redirect' },
    },
  })
}
const document = new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: '3.1.0',
  info: { title: 'BAVARIA BFF', version: '1.1.0' },
  servers: [{ url: '/', description: 'Same-origin BFF' }],
})
writeFileSync(
  fileURLToPath(new URL('../docs/openapi.json', import.meta.url)),
  `${JSON.stringify(document, null, 2)}\n`,
)
