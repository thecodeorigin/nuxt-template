import {
  organizationMemberTable,
  organizationTable,
  roleTable,
  userTable,
} from '@nuxthub/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import {
  getSystemOrganizationId,
  membersWithRole,
} from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'

export type GrantTarget
  = | { kind: 'role', organization_slug: string, role_name: string }
    | { kind: 'members', organization_slug: string, emails: readonly string[] }
    | { kind: 'system-admins' }

export interface GrantAbilityInput {
  ability: string
  target: GrantTarget
}

export interface GrantAbilityResult {
  ability: string
  target: GrantTarget
  changed: boolean
  affected_users: number
  refreshed_sessions: number
}

/**
 * Add `ability` to a scope of users. Use after rolling out a new feature
 * gated by a permission key so the right cohort gains it without re-login:
 *
 * - kind:'role' — append to a named role's permissions; all members holding
 *   that role pick it up. The right tool for "all Pro-plan members"
 *   provided your billing layer maps plans to roles.
 * - kind:'members' — append to the specific members' direct abilities. The
 *   tool for "these N customers".
 * - kind:'system-admins' — append to every system-org member's abilities.
 *   For new admin powers; usually you'd edit SYSTEM_GRANTS.admin and then
 *   run `update:admin` instead, but this is the bypass for hotfixes.
 *
 * Idempotent — re-runs are no-ops once the ability is present.
 */
export async function grantAbility(input: GrantAbilityInput): Promise<GrantAbilityResult> {
  switch (input.target.kind) {
    case 'role':
      return grantToRole(input.ability, input.target.organization_slug, input.target.role_name, input.target)
    case 'members':
      return grantToMembers(input.ability, input.target.organization_slug, input.target.emails, input.target)
    case 'system-admins':
      return grantToSystemAdmins(input.ability, input.target)
  }
}

async function grantToRole(
  ability: string,
  organization_slug: string,
  role_name: string,
  target: GrantTarget,
): Promise<GrantAbilityResult> {
  const org = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.slug, organization_slug),
    columns: { id: true },
  })
  if (!org)
    throw new Error(`Organization not found: ${organization_slug}`)

  const role = await db.query.roleTable.findFirst({
    where: and(eq(roleTable.organization_id, org.id), eq(roleTable.name, role_name)),
  })
  if (!role)
    throw new Error(`Role not found: ${role_name} in ${organization_slug}`)

  if (role.permissions.includes(ability))
    return { ability, target, changed: false, affected_users: 0, refreshed_sessions: 0 }

  const nextPerms = [...role.permissions, ability]
  await db.update(roleTable).set({ permissions: nextPerms, updated_at: new Date() }).where(eq(roleTable.id, role.id))

  const userIds = await membersWithRole(role.id)
  let refreshed_sessions = 0
  for (const userId of userIds)
    refreshed_sessions += await refreshUserSessions(userId)

  return { ability, target, changed: true, affected_users: userIds.length, refreshed_sessions }
}

async function grantToMembers(
  ability: string,
  organization_slug: string,
  emails: readonly string[],
  target: GrantTarget,
): Promise<GrantAbilityResult> {
  if (emails.length === 0)
    return { ability, target, changed: false, affected_users: 0, refreshed_sessions: 0 }

  const org = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.slug, organization_slug),
    columns: { id: true },
  })
  if (!org)
    throw new Error(`Organization not found: ${organization_slug}`)

  const users = await db.query.userTable.findMany({
    where: inArray(userTable.primary_email, [...emails]),
    columns: { id: true, primary_email: true },
  })
  if (users.length === 0)
    return { ability, target, changed: false, affected_users: 0, refreshed_sessions: 0 }

  const userIds = users.map((u: { id: string }) => u.id)
  const members = await db.query.organizationMemberTable.findMany({
    where: and(
      eq(organizationMemberTable.organization_id, org.id),
      inArray(organizationMemberTable.user_id, userIds),
    ),
    columns: { id: true, user_id: true, abilities: true },
  })

  let affected_users = 0
  let refreshed_sessions = 0
  for (const m of members) {
    const current = m.abilities ?? []
    if (current.includes(ability))
      continue
    await db.update(organizationMemberTable)
      .set({ abilities: [...current, ability] })
      .where(eq(organizationMemberTable.id, m.id))
    affected_users++
    refreshed_sessions += await refreshUserSessions(m.user_id)
  }

  return { ability, target, changed: affected_users > 0, affected_users, refreshed_sessions }
}

async function grantToSystemAdmins(
  ability: string,
  target: GrantTarget,
): Promise<GrantAbilityResult> {
  const system_org_id = await getSystemOrganizationId()
  if (!system_org_id)
    return { ability, target, changed: false, affected_users: 0, refreshed_sessions: 0 }

  const members = await db.query.organizationMemberTable.findMany({
    where: eq(organizationMemberTable.organization_id, system_org_id),
    columns: { id: true, user_id: true, abilities: true },
  })

  let affected_users = 0
  let refreshed_sessions = 0
  for (const m of members) {
    const current = m.abilities ?? []
    if (current.includes(ability))
      continue
    await db.update(organizationMemberTable)
      .set({ abilities: [...current, ability] })
      .where(eq(organizationMemberTable.id, m.id))
    affected_users++
    refreshed_sessions += await refreshUserSessions(m.user_id)
  }

  return { ability, target, changed: affected_users > 0, affected_users, refreshed_sessions }
}
