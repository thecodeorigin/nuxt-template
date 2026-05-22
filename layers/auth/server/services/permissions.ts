import { db } from '@nuxthub/db'
import { permissionTable } from '@nuxthub/db/schema'
import { buildPermissionCatalog } from '#layers/auth/shared/permissions'

export async function seedPermissions(): Promise<number> {
  const catalog = buildPermissionCatalog()
  for (const p of catalog) {
    await db
      .insert(permissionTable)
      .values({ key: p.key, subject: p.subject, action: p.action, scope: p.scope, org_kind: p.org_kind, description: p.description })
      .onConflictDoUpdate({
        target: permissionTable.key,
        set: { subject: p.subject, action: p.action, scope: p.scope, org_kind: p.org_kind, description: p.description },
      })
  }
  return catalog.length
}
