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

/**
 * Bump this integer whenever ability defaults change (new feature, renamed subject, etc.).
 * Any KV session with a lower generation is rebuilt from DB on the user's next request —
 * no forced re-login required.
 */
export const SESSION_GENERATION = 3

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
    generation: SESSION_GENERATION,
  }
}

/** The single place that writes `session:{sid}` + the cookie. */
export async function persistSession(event: H3Event, user: UserRow, opts: BuildSessionOpts & { sessionId?: string }) {
  const session = await buildSession(user, opts)
  const sessionId = opts.sessionId ?? simplifyNanoId()
  await kv.set(`session:${sessionId}`, session, { ttl: TTL })
  await indexUserSession(user.id, sessionId)
  setCookie(event, 'sessionid', sessionId, { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax', maxAge: TTL, path: '/' })
  return { session, sessionId }
}

/**
 * Secondary index: the set of live session ids for a user, so a permission
 * refresh touches only that user's sessions instead of scanning every session
 * in KV. It's a candidate set — `refreshUserSessions` re-validates each entry
 * and self-heals (prunes dead/reassigned ids), so logout/expiry/impersonation
 * drift never need to update it eagerly.
 */
function userSessionsKey(userId: string): string {
  return `user-sessions:${userId}`
}

async function indexUserSession(userId: string, sessionId: string): Promise<void> {
  const key = userSessionsKey(userId)
  const ids = (await kv.get<string[]>(key)) ?? []
  if (!ids.includes(sessionId)) {
    ids.push(sessionId)
    await kv.set(key, ids, { ttl: TTL })
  }
}

/** Overwrite an existing session (impersonation / switch / refresh). */
export async function writeSession(sessionId: string, session: AuthUser) {
  await kv.set(`session:${sessionId}`, session, { ttl: TTL })
  await indexUserSession(session.id, sessionId)
}

export interface SessionCandidate {
  sessionId: string
  session: AuthUser | null
}

/**
 * Pure partition for {@link refreshUserSessions}: from the indexed candidates,
 * keep only sessions that still exist AND still belong to `userId` (a session
 * reassigned by impersonation, or already deleted/expired, is dropped). The
 * surviving ids become the pruned index.
 */
export function planSessionRefresh(candidates: SessionCandidate[], userId: string): {
  toRebuild: { sessionId: string, session: AuthUser }[]
  survivingIds: string[]
} {
  const toRebuild: { sessionId: string, session: AuthUser }[] = []
  const survivingIds: string[] = []
  for (const { sessionId, session } of candidates) {
    if (!session || session.id !== userId)
      continue
    toRebuild.push({ sessionId, session })
    survivingIds.push(sessionId)
  }
  return { toRebuild, survivingIds }
}

/**
 * Re-resolve and rewrite every live KV session belonging to `userId` so a
 * permission change (membership edit/removal) takes effect on the user's next
 * page load — no re-login required. Re-validates the active org against current
 * membership and recomputes the effective ability union.
 */
export async function refreshUserSessions(userId: string): Promise<number> {
  const indexKey = userSessionsKey(userId)
  const sessionIds = (await kv.get<string[]>(indexKey)) ?? []
  if (sessionIds.length === 0)
    return 0
  const user = await db.query.userTable.findFirst({ where: eq(userTable.id, userId) })
  if (!user) {
    await kv.del(indexKey)
    return 0
  }
  const candidates: SessionCandidate[] = await Promise.all(
    sessionIds.map(async sessionId => ({ sessionId, session: await kv.get<AuthUser>(`session:${sessionId}`) })),
  )
  const { toRebuild, survivingIds } = planSessionRefresh(candidates, userId)
  for (const { sessionId, session } of toRebuild) {
    let activeOrganizationId = session.activeOrganizationId
    if (activeOrganizationId && !(await isMember(userId, activeOrganizationId)))
      activeOrganizationId = await defaultActiveOrganizationId(userId)
    const next = await buildSession(user, {
      provider: session.provider,
      activeOrganizationId,
      impersonator: session.impersonator,
    })
    await writeSession(sessionId, next)
  }
  // Self-heal: drop dead/reassigned ids so the index can't grow unbounded.
  if (survivingIds.length !== sessionIds.length) {
    if (survivingIds.length === 0)
      await kv.del(indexKey)
    else
      await kv.set(indexKey, survivingIds, { ttl: TTL })
  }
  return toRebuild.length
}
