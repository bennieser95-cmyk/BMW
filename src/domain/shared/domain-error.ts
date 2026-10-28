export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code)
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, code)
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, code = 'CONFLICT') {
    super(message, code)
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('Authentication required', 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends DomainError {
  constructor(code = 'FORBIDDEN') {
    super('Request not permitted', code)
  }
}

export class ServiceUnavailableError extends DomainError {
  constructor(code = 'SERVICE_UNAVAILABLE') {
    super('Service temporarily unavailable', code)
  }
}
