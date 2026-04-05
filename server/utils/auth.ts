import type { H3Event } from 'h3'

export interface AuthUser {
  id: string
  primary_email: string
  primary_phone: string | null
  username: string
  name: string
  avatar: string | null
  verified: boolean
  provider: string
}

/**
 * An authenticated wrapper of Nitro defineEventHandler
 *
 * @example ```ts
 * import { defineAuthenticatedHandler } from '~~/server/utils/auth'
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

    const session = await storage.getItem<AuthUser>(`session:${sessionId}`)
    if (!session) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    return handler(event, session)
  })
}
