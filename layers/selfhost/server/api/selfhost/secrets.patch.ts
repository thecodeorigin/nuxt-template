import { db } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { readValidatedBody } from 'h3'
import { decryptSecret, encryptSecret } from '~~/server/utils/crypto'
import { organizationTable } from '#layers/auth/server/db/schema'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { selfhostAuditTable, selfhostDeploymentSecretTable, selfhostDeploymentTable } from '#layers/selfhost/server/db/schema'
import { setWorkerSecret } from '#layers/selfhost/server/services/cloudflare'
import { findSecretDef, isKnownSecretKey } from '#layers/selfhost/server/services/secrets'
import { PatchSecretsBodySchema } from '#layers/selfhost/shared/schemas/secret'

export default defineAuthorizedHandler(['selfhost:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId!
  const body = await readValidatedBody(event, PatchSecretsBodySchema.parse)

  // Owner-only — secrets include payment + auth credentials.
  const org = await db.query.organizationTable.findFirst({ where: eq(organizationTable.id, orgId) })
  if (!org || org.owner_id !== session.id)
    throw createError({ statusCode: 403, statusMessage: 'Only the organization owner can modify deployment secrets' })

  // Reject unknown keys early so a typo can't poison the catalog.
  const unknown = body.updates.filter(u => !isKnownSecretKey(u.key)).map(u => u.key)
  if (unknown.length)
    throw createError({ statusCode: 400, statusMessage: `Unknown secret key(s): ${unknown.join(', ')}` })

  // Encrypt + upsert to DB.
  for (const u of body.updates) {
    const enc = await encryptSecret(u.value)
    await db.insert(selfhostDeploymentSecretTable)
      .values({ organization_id: orgId, key: u.key, ciphertext: enc.ciphertext, iv: enc.iv })
      .onConflictDoUpdate({
        target: [selfhostDeploymentSecretTable.organization_id, selfhostDeploymentSecretTable.key],
        set: { ciphertext: enc.ciphertext, iv: enc.iv, updated_at: new Date() },
      })
  }

  // If a deployment exists, push the changed secrets to Cloudflare immediately so they take effect without a redeploy.
  const deployment = await db.query.selfhostDeploymentTable.findFirst({
    where: eq(selfhostDeploymentTable.organization_id, orgId),
  })
  let pushedToCf = 0
  if (deployment?.cf_account_id && deployment?.cf_script_name && deployment?.cf_token_ciphertext && deployment?.cf_token_iv) {
    const cfToken = await decryptSecret({ ciphertext: deployment.cf_token_ciphertext, iv: deployment.cf_token_iv })
    for (const u of body.updates) {
      const def = findSecretDef(u.key)
      if (!def)
        continue
      await setWorkerSecret(cfToken, deployment.cf_account_id, deployment.cf_script_name, u.key, u.value, def.type)
      pushedToCf++
    }
  }

  const keyList = body.updates.map(u => u.key).join(',')
  await db.insert(selfhostAuditTable).values({
    organization_id: orgId,
    actor_user_id: session.id,
    action: 'secret_update',
    success: true,
    cf_account_id: deployment?.cf_account_id ?? null,
    error_message: keyList.length > 500 ? `${keyList.slice(0, 497)}...` : keyList,
    finished_at: new Date(),
  })

  return { updated: body.updates.length, pushedToCloudflare: pushedToCf }
})
