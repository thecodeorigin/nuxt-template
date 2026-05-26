import type { H3Event } from 'h3'
import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { eq } from 'drizzle-orm'
import { buildSession, SESSION_GENERATION, writeSession } from '#layers/auth/server/services/session'

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
  bio: string | null
  verified: boolean
  provider: string
  abilities: string[] // effective union (system ∪ active org)
  activeOrganizationId: string | null
  impersonator?: ImpersonatorInfo | null
  /** Incremented when ability defaults change; stale sessions are refreshed lazily. */
  generation?: number
}

declare module 'h3' {
  interface H3EventContext {
    authUser?: AuthUser
    activeOrganizationId?: string | null
  }
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
    const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')

    if (!sessionId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const stored = await kv.get<AuthUser>(`session:${sessionId}`)
    if (!stored) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    let session: AuthUser
    if ((stored.generation ?? 0) < SESSION_GENERATION) {
      const user = await db.query.userTable.findFirst({ where: eq(userTable.id, stored.id) })
      if (!user)
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      session = await buildSession(user, {
        provider: stored.provider,
        activeOrganizationId: stored.activeOrganizationId,
        impersonator: stored.impersonator,
      })
      await writeSession(sessionId, session)
    }
    else {
      session = {
        ...stored,
        abilities: stored.abilities ?? [],
        activeOrganizationId: stored.activeOrganizationId ?? null,
      }
    }

    event.context.authUser = session
    event.context.activeOrganizationId = session.activeOrganizationId

    return handler(event, session)
  })
}
