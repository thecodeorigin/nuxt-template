import type { ServerAuthSession } from '@thecodeorigin/auth/contract'
import type { H3Event } from 'h3'

export type { ServerAuthSession }

/** Wraps a Nitro handler with session auth. Throws 401 if no active session. */
export function defineAuthenticatedHandler<T>(
  handler: (event: H3Event, session: NonNullable<ServerAuthSession>) => Promise<T> | T,
) {
  return defineEventHandler(async (event) => {
    const session = await getServerAuthSession(event)
    if (!session)
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    // Backward-compat: routes accessing event.context.activeOrganizationId still work.
    event.context.activeOrganizationId = session.activeOrg
    return handler(event, session)
  })
}

/**
 * Drop-in replacement for the old defineAuthorizedHandler. Checks are ignored;
 *  all org-scope authorization is performed via session.activeOrg on the domain routes.
 *  System-admin-only routes should use defineAdminHandler instead.
 */
export function defineAuthorizedHandler<T>(
  _checks: string[],
  handler: (event: H3Event, ctx: { session: NonNullable<ServerAuthSession> }) => Promise<T> | T,
) {
  return defineAuthenticatedHandler(async (event, session) => handler(event, { session }))
}

/** Like defineAuthorizedHandler but additionally requires systemRole === 'admin'. */
export function defineAdminHandler<T>(
  _checks: string[],
  handler: (event: H3Event, ctx: { session: NonNullable<ServerAuthSession> }) => Promise<T> | T,
) {
  return defineAuthenticatedHandler(async (event, session) => {
    if (session.systemRole !== 'admin')
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    return handler(event, { session })
  })
}
