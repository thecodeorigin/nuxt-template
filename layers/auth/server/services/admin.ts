import type { userTable as UserTableType } from '@nuxthub/db/schema'
import { organizationMemberTable, organizationTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { SYSTEM_GRANTS, SYSTEM_ORG } from '#layers/auth/server/constants/defaults'
import {
  createPersonalOrganization,
  getSystemOrganizationId,
} from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'

export interface CreateSystemAdminInput {
  email?: string
  name?: string
}

export interface CreateSystemAdminResult {
  user: typeof UserTableType.$inferSelect
  system_org_id: string
  created: boolean
  granted: readonly string[]
}

function defaultAdminEmail(): string {
  const raw = process.env.NUXT_PUBLIC_BASE_DOMAIN || 'localhost'
  const host = raw.split(':')[0] || 'localhost'
  return `admin@${host}`
}

export async function createSystemAdmin(
  input: CreateSystemAdminInput = {},
): Promise<CreateSystemAdminResult> {
  const email = input.email ?? defaultAdminEmail()
  const name = input.name ?? 'System Admin'
  const username = email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9_]/g, '_')

  let user = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, email) })
  let userCreated = false
  if (!user) {
    const [inserted] = await db.insert(userTable).values({
      primary_email: email,
      username,
      name,
      verified: true,
    }).returning()
    user = inserted!
    userCreated = true
    await createPersonalOrganization(user)
  }

  let systemOrg = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.slug, SYSTEM_ORG.slug),
  })
  if (!systemOrg) {
    const [insertedOrg] = await db.insert(organizationTable).values({
      slug: SYSTEM_ORG.slug,
      name: SYSTEM_ORG.name,
      is_system: true,
    }).returning()
    systemOrg = insertedOrg!
  }

  const abilities = [...SYSTEM_GRANTS.admin]
  await db.insert(organizationMemberTable).values({
    user_id: user.id,
    organization_id: systemOrg.id,
    abilities,
  }).onConflictDoUpdate({
    target: [organizationMemberTable.user_id, organizationMemberTable.organization_id],
    set: { abilities },
  })

  return {
    user,
    system_org_id: systemOrg.id,
    created: userCreated,
    granted: SYSTEM_GRANTS.admin,
  }
}

export interface RegrantSystemAdminsResult {
  system_org_id: string | null
  updated_members: number
  refreshed_sessions: number
  abilities: readonly string[]
}

/**
 * Re-apply the current SYSTEM_GRANTS.admin to every member of the system org
 * and rewrite their live KV sessions. Run after editing SYSTEM_GRANTS.admin
 * in services/seed.ts so existing admins gain (or lose) the new keys
 * without re-logging in.
 */
export async function regrantSystemAdmins(): Promise<RegrantSystemAdminsResult> {
  const system_org_id = await getSystemOrganizationId()
  if (!system_org_id)
    return { system_org_id: null, updated_members: 0, refreshed_sessions: 0, abilities: SYSTEM_GRANTS.admin }

  const members = await db.query.organizationMemberTable.findMany({
    where: eq(organizationMemberTable.organization_id, system_org_id),
    columns: { id: true, user_id: true },
  })

  const abilities = [...SYSTEM_GRANTS.admin]
  let refreshed_sessions = 0
  for (const m of members) {
    await db.update(organizationMemberTable)
      .set({ abilities })
      .where(eq(organizationMemberTable.id, m.id))
    refreshed_sessions += await refreshUserSessions(m.user_id)
  }

  return {
    system_org_id,
    updated_members: members.length,
    refreshed_sessions,
    abilities: SYSTEM_GRANTS.admin,
  }
}
