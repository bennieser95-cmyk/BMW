import pino from 'pino'

import { getCorrelationId } from './correlation-id'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'authorization',
      'cookie',
      'email',
      'firstName',
      'lastName',
      'name',
      'password',
      'phone',
      'postalCode',
      'token',
      '*.authorization',
      '*.cookie',
      '*.email',
      '*.firstName',
      '*.lastName',
      '*.name',
      '*.password',
      '*.phone',
      '*.postalCode',
      '*.token',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
  mixin() {
    const correlationId = getCorrelationId()
    return correlationId === undefined ? {} : { correlationId }
  },
})
