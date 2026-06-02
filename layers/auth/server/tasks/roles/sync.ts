import type { Role } from '@nuxthub/db/schema'
import type { DefaultRole } from '#layers/auth/shared/permissions'
import { db } from '@nuxthub/db'
import { roleTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { membersWithRole } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { DEFAULT_ROLE_ABILITIES, DEFAULT_ROLE_NAME } from '#layers/auth/shared/permissions'

const NAME_TO_DEFAULT_ROLE: Record<string, DefaultRole> = Object.fromEntries(
  (Object.entries(DEFAULT_ROLE_NAME) as [DefaultRole, string][]).map(([role, name]) => [name, role]),
)

function sameAbilities(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length)
    return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

export interface RolePermissionChange {
  id: string
  name: string
  organization_id: string
  permissions: string[]
}

/** Pure: which system roles drift from the source of truth + their target perms. */
export function planRolePermissionSync(
  roles: Pick<Role, 'id' | 'name' | 'permissions' | 'organization_id'>[],
): RolePermissionChange[] {
  const changes: RolePermissionChange[] = []
  for (const role of roles) {
    const defaultRole = NAME_TO_DEFAULT_ROLE[role.name]
    if (!defaultRole)
      continue
    const desired = [...DEFAULT_ROLE_ABILITIES[defaultRole]]
    if (!sameAbilities(role.permissions, desired))
      changes.push({ id: role.id, name: role.name, organization_id: role.organization_id, permissions: desired })
  }
  return changes
}

/**
 * Replace every org's system-role permissions with DEFAULT_ROLE_ABILITIES. Run
 * after editing the source-of-truth map (feature rollout). Custom (non-system)
 * roles and per-member direct abilities are never touched. Affected users'
 * sessions are rewritten in place so the change is live immediately (matches the
 * existing live-revocation pattern used by the roles/abilities routes).
 */
export async function syncDefaultRolePermissions(): Promise<{
  orgsScanned: number
  rolesUpdated: number
  sessionsRefreshed: number
}> {
  const systemRoles = await db.query.roleTable.findMany({ where: eq(roleTable.is_system, true) })
  const changes = planRolePermissionSync(systemRoles)

  const affected = new Set<string>()
  for (const change of changes) {
    await db.update(roleTable)
      .set({ permissions: change.permissions, updated_at: new Date() })
      .where(eq(roleTable.id, change.id))
    for (const uid of await membersWithRole(change.id))
      affected.add(uid)
  }
  for (const uid of affected)
    await refreshUserSessions(uid)

  return {
    orgsScanned: new Set(systemRoles.map(r => r.organization_id)).size,
    rolesUpdated: changes.length,
    sessionsRefreshed: affected.size,
  }
}

export default defineTask({
  meta: { name: 'roles:sync', description: 'Replace every org system role with DEFAULT_ROLE_ABILITIES (feature rollout).' },
  run: async () => ({ result: await syncDefaultRolePermissions() }),
})
