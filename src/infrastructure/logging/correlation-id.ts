import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

const correlationContext = new AsyncLocalStorage<string>()

export function runWithCorrelationId<TValue>(
  operation: () => TValue,
  correlationId = randomUUID(),
): TValue {
  return correlationContext.run(correlationId, operation)
}

export function getCorrelationId(): string | undefined {
  return correlationContext.getStore()
}
