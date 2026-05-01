import type { H3Event } from 'h3'

export interface ImpersonatorInfo {
  id: string
  username: string
  name: string
  primary_email: string
  abilities: string[]
}

export interface AuthUser {
  id: string
  primary_email: string
  primary_phone: string | null
  username: string
  name: string
  avatar: string | null
  verified: boolean
  provider: string
  abilities: string[]
  impersonator?: ImpersonatorInfo | null
}

/**
 * An authenticated wrapper of Nitro defineEventHandler
 *
 * @example ```ts
 * import { defineAuthenticatedHandler } from '~~/server/services/auth'
 *
 * export default defineAuthenticatedHandler(async (event, session) => {
 *   // Your authenticated logic here
 * })
 * ```
 */
export function defineAuthenticatedHandler<T>(
  handler: (event: H3Event, session: AuthUser) => Promise<T> | T,
) {
  return defineEventHandler(async (event) => {
    const storage = useStorage('redis')
    const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')

    if (!sessionId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const stored = await storage.getItem<AuthUser>(`session:${sessionId}`)
    if (!stored) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const session: AuthUser = { ...stored, abilities: stored.abilities ?? [] }

    return handler(event, session)
  })
}
