import { db } from '@nuxthub/db'
import { organizationTable, selfhostAuditTable, selfhostDeploymentSecretTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { getValidatedRouterParams } from 'h3'
import { defineAdminHandler } from '~~/server/utils/auth'
import { decryptSecret } from '~~/server/utils/crypto'
import { isKnownSecretKey } from '#layers/selfhost/server/services/secrets'
import { RevealSecretParamsSchema } from '#layers/selfhost/shared/schemas/secret'

// Reveals a single stored secret in plaintext. Owner-only. Every call is audit-logged.
export default defineAdminHandler(['selfhost:manage'], async (event, { session }) => {
  const orgId = session.activeOrg!
  const { key } = await getValidatedRouterParams(event, RevealSecretParamsSchema.parse)

  if (!isKnownSecretKey(key))
    throw createError({ statusCode: 400, statusMessage: `Unknown secret key: ${key}` })

  const org = await db.query.organizationTable.findFirst({ where: eq(organizationTable.id, orgId) })
  if (!org || org.owner_id !== session.sub)
    throw createError({ statusCode: 403, statusMessage: 'Only the organization owner can reveal deployment secrets' })

  const row = await db.query.selfhostDeploymentSecretTable.findFirst({
    where: and(
      eq(selfhostDeploymentSecretTable.organization_id, orgId),
      eq(selfhostDeploymentSecretTable.key, key),
    ),
  })

  if (!row)
    throw createError({ statusCode: 404, statusMessage: `Secret not set: ${key}` })

  const value = await decryptSecret({ ciphertext: row.ciphertext, iv: row.iv })

  await db.insert(selfhostAuditTable).values({
    organization_id: orgId,
    actor_user_id: session.sub,
    action: 'secret_reveal',
    success: true,
    error_message: key,
    finished_at: new Date(),
  })

  return { key, value, updatedAt: row.updated_at }
})
