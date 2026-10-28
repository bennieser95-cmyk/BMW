export interface AuthenticatedUser {
  id: string
  email: string
  name?: string
  emailVerified?: boolean
}

export interface AuthPort {
  getCurrentUser(): Promise<AuthenticatedUser | null>
  requireUser(): Promise<AuthenticatedUser>
}
