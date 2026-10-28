export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

export interface SecurityPort {
  consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>
  claimWebhook(digest: string, expiresAt: Date): Promise<boolean>
  purgeExpired(): Promise<void>
}
