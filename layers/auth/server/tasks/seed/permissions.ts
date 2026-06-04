import { db } from '@nuxthub/db'
import { permissionTable } from '@nuxthub/db/schema'
import { getRegisteredCatalog } from '#layers/auth/server/services/permissions-registry'

export async function seedPermissions(): Promise<number> {
  const catalog = getRegisteredCatalog()
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

export default defineTask({
  meta: { name: 'seed:permissions', description: 'Upsert the ability/permission catalog.' },
  run: async () => ({ result: { permissions: await seedPermissions() } }),
})
