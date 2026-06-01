import { db } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { selfhostDeploymentSecretTable } from '#layers/selfhost/server/db/schema'
import { SELFHOST_SECRET_CATALOG } from '#layers/selfhost/server/services/secrets'

// Never returns the actual secret values. Just the catalog + isSet flags.
export default defineAuthorizedHandler(['selfhost:read', 'selfhost:manage'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId!
  const stored = await db.query.selfhostDeploymentSecretTable.findMany({
    where: eq(selfhostDeploymentSecretTable.organization_id, orgId),
    columns: { key: true, updated_at: true },
  })
  const storedMap = new Map(stored.map(s => [s.key, s.updated_at] as const))

  const items = SELFHOST_SECRET_CATALOG.map(def => ({
    key: def.key,
    label: def.label,
    description: def.description,
    category: def.category,
    type: def.type,
    isAuto: !!def.auto,
    isSet: storedMap.has(def.key),
    updatedAt: storedMap.get(def.key) ?? null,
  }))

  return { items }
})
