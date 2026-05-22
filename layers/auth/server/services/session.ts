import type { H3Event } from 'h3'
import type { AuthUser, ImpersonatorInfo } from '#layers/auth/server/services/auth'
import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { eq } from 'drizzle-orm'
import { setCookie } from 'h3'
import { simplifyNanoId } from '~~/shared/utils/id'
import { defaultActiveOrganizationId, isMember, loadEffectiveAbilities } from '#layers/auth/server/services/organization'

type UserRow = typeof userTable.$inferSelect

const TTL = 60 * 60 * 24 * 7

export interface BuildSessionOpts {
  provider: string
  activeOrganizationId?: string | null // undefined → resolve default
  impersonator?: ImpersonatorInfo | null
}

export async function buildSession(user: UserRow, opts: BuildSessionOpts): Promise<AuthUser> {
  const activeOrganizationId = opts.activeOrganizationId !== undefined
    ? opts.activeOrganizationId
    : await defaultActiveOrganizationId(user.id)
  const abilities = await loadEffectiveAbilities(user.id, activeOrganizationId)
  return {
    id: user.id,
    primary_email: user.primary_email,
    primary_phone: user.primary_phone,
    username: user.username ?? '',
    name: user.name ?? '',
    avatar: user.avatar,
    bio: user.bio ?? null,
    verified: user.verified ?? false,
    provider: opts.provider,
    abilities,
    activeOrganizationId,
    impersonator: opts.impersonator ?? null,
  }
}

/** The single place that writes `session:{sid}` + the cookie. */
export async function persistSession(event: H3Event, user: UserRow, opts: BuildSessionOpts & { sessionId?: string }) {
  const session = await buildSession(user, opts)
  const sessionId = opts.sessionId ?? simplifyNanoId()
  await kv.set(`session:${sessionId}`, session, { ttl: TTL })
  setCookie(event, 'sessionid', sessionId, { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax', maxAge: TTL, path: '/' })
  return { session, sessionId }
}

/** Overwrite an existing session (impersonation / switch / refresh). */
export async function writeSession(sessionId: string, session: AuthUser) {
  await kv.set(`session:${sessionId}`, session, { ttl: TTL })
}

/**
 * Re-resolve and rewrite every live KV session belonging to `userId` so a
 * permission change (membership edit/removal) takes effect on the user's next
 * page load — no re-login required. Re-validates the active org against current
 * membership and recomputes the effective ability union.
 */
export async function refreshUserSessions(userId: string): Promise<number> {
  const keys = await kv.keys('session:')
  if (keys.length === 0)
    return 0
  const [user] = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1)
  if (!user)
    return 0
  let updated = 0
  for (const key of keys) {
    const session = await kv.get<AuthUser>(key)
    if (!session || session.id !== userId)
      continue
    const sessionId = key.slice('session:'.length)
    let activeOrganizationId = session.activeOrganizationId
    if (activeOrganizationId && !(await isMember(userId, activeOrganizationId)))
      activeOrganizationId = await defaultActiveOrganizationId(userId)
    const next = await buildSession(user, {
      provider: session.provider,
      activeOrganizationId,
      impersonator: session.impersonator,
    })
    await writeSession(sessionId, next)
    updated++
  }
  return updated
}
