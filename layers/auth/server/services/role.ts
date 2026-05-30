import type { roleTable as RoleTableType } from '@nuxthub/db/schema'
import { organizationTable, roleTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { membersWithRole } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'

type RoleRow = typeof RoleTableType.$inferSelect

export interface CreateOrganizationRoleInput {
  organization_slug: string
  name: string
  description?: string | null
  permissions: readonly string[]
  is_system?: boolean
}

export interface CreateOrganizationRoleResult {
  role: RoleRow
  created: boolean
}

async function getOrgIdBySlug(slug: string): Promise<string> {
  const org = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.slug, slug),
    columns: { id: true },
  })
  if (!org)
    throw new Error(`Organization not found: ${slug}`)
  return org.id
}

/**
 * Idempotent role creation. The unique constraint is (organization_id, name)
 * so the same name in two orgs is fine; re-running in the same org returns
 * the existing role unchanged.
 */
export async function createOrganizationRole(
  input: CreateOrganizationRoleInput,
): Promise<CreateOrganizationRoleResult> {
  const organization_id = await getOrgIdBySlug(input.organization_slug)

  const existing = await db.query.roleTable.findFirst({
    where: and(eq(roleTable.organization_id, organization_id), eq(roleTable.name, input.name)),
  })
  if (existing)
    return { role: existing, created: false }

  const [inserted] = await db.insert(roleTable).values({
    organization_id,
    name: input.name,
    description: input.description ?? null,
    permissions: [...input.permissions],
    is_system: input.is_system ?? false,
  }).returning()
  return { role: inserted!, created: true }
}

export interface UpdateOrganizationRoleInput {
  organization_slug: string
  role_name: string
  permissions?: readonly string[]
  description?: string | null
}

export interface UpdateOrganizationRoleResult {
  role: RoleRow
  changed: boolean
  affected_users: number
  refreshed_sessions: number
}

/**
 * Patches a role's permissions or description. Refreshes the KV session of
 * every user who holds the role so the new permissions apply on the next
 * request — no re-login required. Idempotent — no-op if the patch matches
 * current state.
 */
export async function updateOrganizationRole(
  input: UpdateOrganizationRoleInput,
): Promise<UpdateOrganizationRoleResult> {
  const organization_id = await getOrgIdBySlug(input.organization_slug)

  const role = await db.query.roleTable.findFirst({
    where: and(eq(roleTable.organization_id, organization_id), eq(roleTable.name, input.role_name)),
  })
  if (!role)
    throw new Error(`Role not found: ${input.role_name} in ${input.organization_slug}`)

  const nextPerms = input.permissions ? [...input.permissions] : role.permissions
  const nextDesc = input.description === undefined ? role.description : (input.description ?? null)
  const permsChanged = !sameSet(role.permissions, nextPerms)
  const descChanged = nextDesc !== role.description
  if (!permsChanged && !descChanged)
    return { role, changed: false, affected_users: 0, refreshed_sessions: 0 }

  const [updated] = await db.update(roleTable)
    .set({ permissions: nextPerms, description: nextDesc, updated_at: new Date() })
    .where(eq(roleTable.id, role.id))
    .returning()

  let refreshed_sessions = 0
  let affected_users = 0
  if (permsChanged) {
    const userIds = await membersWithRole(role.id)
    affected_users = userIds.length
    for (const userId of userIds)
      refreshed_sessions += await refreshUserSessions(userId)
  }

  return { role: updated!, changed: true, affected_users, refreshed_sessions }
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length)
    return false
  const setA = new Set(a)
  for (const x of b) {
    if (!setA.has(x))
      return false
  }
  return true
}
