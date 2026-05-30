import type { userTable as UserTableType } from '@nuxthub/db/schema'
import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createPersonalOrganization } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'

type UserRow = typeof UserTableType.$inferSelect
type UserPatch = Partial<typeof UserTableType.$inferInsert>

export interface CreateUserInput {
  email: string
  name?: string
  username?: string
  primary_phone?: string | null
  verified?: boolean
}

export interface CreateUserResult {
  user: UserRow
  created: boolean
  personal_org_id: string
}

function deriveUsername(email: string): string {
  return email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9_]/g, '_')
}

/**
 * Idempotent user creation. Returns the existing user if one already has the
 * email; otherwise inserts and creates the personal org. Production-grade
 * counterpart to `provisionPersonalUser` (which is dev-only and blindly inserts).
 */
export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const existing = await db.query.userTable.findFirst({
    where: eq(userTable.primary_email, input.email),
  })

  let user: UserRow
  let created = false
  if (existing) {
    user = existing
  }
  else {
    const [inserted] = await db.insert(userTable).values({
      primary_email: input.email,
      username: input.username ?? deriveUsername(input.email),
      name: input.name ?? input.username ?? deriveUsername(input.email),
      primary_phone: input.primary_phone ?? null,
      verified: input.verified ?? true,
    }).returning()
    user = inserted!
    created = true
  }

  const org = await createPersonalOrganization(user)
  return { user, created, personal_org_id: org.id }
}

export interface CreateUsersResult {
  total: number
  created: number
  reused: number
  users: Array<{ id: string, primary_email: string, created: boolean }>
}

export async function createUsers(inputs: readonly CreateUserInput[]): Promise<CreateUsersResult> {
  const users: CreateUsersResult['users'] = []
  let created = 0
  let reused = 0
  for (const input of inputs) {
    const result = await createUser(input)
    users.push({ id: result.user.id, primary_email: result.user.primary_email, created: result.created })
    if (result.created)
      created++
    else
      reused++
  }
  return { total: inputs.length, created, reused, users }
}

export interface UpdateUserInput {
  email: string
  patch: UserPatch
}

export interface UpdateUserResult {
  user: UserRow
  changed: boolean
  refreshed_sessions: number
}

/**
 * Patches a user row by email and refreshes their live KV sessions so any
 * profile / suspension / verification changes reach the running browser on
 * the next request. Idempotent — no-op if the patch matches current state.
 */
export async function updateUser(input: UpdateUserInput): Promise<UpdateUserResult> {
  const user = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, input.email) })
  if (!user)
    throw new Error(`User not found: ${input.email}`)

  const diff = pickChangedFields(user, input.patch)
  if (Object.keys(diff).length === 0)
    return { user, changed: false, refreshed_sessions: 0 }

  const [updated] = await db.update(userTable)
    .set({ ...diff, updated_at: new Date() })
    .where(eq(userTable.id, user.id))
    .returning()

  const refreshed_sessions = await refreshUserSessions(user.id)
  return { user: updated!, changed: true, refreshed_sessions }
}

function pickChangedFields(current: UserRow, patch: UserPatch): UserPatch {
  const diff: UserPatch = {}
  for (const [key, value] of Object.entries(patch) as Array<[keyof UserPatch, UserPatch[keyof UserPatch]]>) {
    if (value === undefined)
      continue
    if (key === 'updated_at' || key === 'created_at' || key === 'id')
      continue
    if ((current as Record<string, unknown>)[key as string] !== value)
      (diff as Record<string, unknown>)[key as string] = value as unknown
  }
  return diff
}
