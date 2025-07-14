import { Context } from 'effect'

// Session context tag - provides authenticated user and session data
export class SessionContext extends Context.Tag('@openfaith/server/SessionContext')<
  SessionContext,
  {
    user: {
      id: string
      email: string
      name: string | null
      role: string
    }
    session: {
      id: string
      activeOrganizationId: string | null
    }
  }
>() {}

// Auth errors
export class UnauthorizedError extends Error {
  readonly _tag = 'UnauthorizedError'
  constructor(message = 'Unauthorized') {
    super(message)
  }
}

export class ForbiddenError extends Error {
  readonly _tag = 'ForbiddenError'
  constructor(message = 'Forbidden') {
    super(message)
  }
}
