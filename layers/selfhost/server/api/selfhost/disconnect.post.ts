import { db } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { selfhostAuditTable, selfhostDeploymentSecretTable, selfhostDeploymentTable } from '#layers/selfhost/server/db/schema'

export default defineAuthorizedHandler(['selfhost:manage'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId!
  const startedAt = new Date()

  await db.update(selfhostDeploymentTable)
    .set({ cf_token_ciphertext: null, cf_token_iv: null, cf_token_expires_at: null, status: 'idle' })
    .where(eq(selfhostDeploymentTable.organization_id, orgId))

  // Per Phase 9 decision: wipe stored secrets too. The UI re-prompts the user on next deploy.
  await db.delete(selfhostDeploymentSecretTable).where(eq(selfhostDeploymentSecretTable.organization_id, orgId))

  await db.insert(selfhostAuditTable).values({
    organization_id: orgId,
    actor_user_id: session.id,
    action: 'disconnect',
    success: true,
    started_at: startedAt,
    finished_at: new Date(),
  })

  return { success: true }
})
