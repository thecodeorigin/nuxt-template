import { permissionTable } from '@nuxthub/db/schema'
import { buildPermissionCatalog } from '#layers/auth/shared/permissions'

export default defineTask({
  meta: {
    name: 'seed:permissions',
    description: 'Upsert the permission catalog into the `permissions` table from layers/auth/shared/permissions.ts.',
  },
  run: async () => {
    const catalog = buildPermissionCatalog()
    for (const p of catalog) {
      await db.insert(permissionTable)
        .values({ key: p.key, subject: p.subject, action: p.action, scope: p.scope, org_kind: p.org_kind, description: p.description })
        .onConflictDoUpdate({
          target: permissionTable.key,
          set: { subject: p.subject, action: p.action, scope: p.scope, org_kind: p.org_kind, description: p.description },
        })
    }
    return { result: 'ok', permissions: catalog.length }
  },
})
