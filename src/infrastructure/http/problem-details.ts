import { randomUUID } from 'node:crypto'

export interface ProblemFieldError {
  field: string
  code: string
}

export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
  traceId: string
  errors?: readonly ProblemFieldError[]
}

export interface ProblemDetailsInput {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  traceId: string
  errors?: readonly ProblemFieldError[]
}

export function buildProblemDetails(input: ProblemDetailsInput): ProblemDetails {
  return {
    type: input.type ?? 'about:blank',
    title: input.title,
    status: input.status,
    traceId: input.traceId,
    ...(input.detail === undefined ? {} : { detail: input.detail }),
    ...(input.instance === undefined ? {} : { instance: input.instance }),
    ...(input.errors === undefined ? {} : { errors: input.errors }),
  }
}

export function createProblemResponse(problem: ProblemDetails): Response {
  return new Response(JSON.stringify(problem), {
    status: problem.status,
    headers: { 'Content-Type': 'application/problem+json' },
  })
}

export function createProblemResponseFromRequest(
  request: Request,
  title: string,
  status: number,
): Response {
  return createProblemResponse(
    buildProblemDetails({
      title,
      status,
      instance: new URL(request.url).pathname,
      traceId: randomUUID(),
    }),
  )
}
