import { db } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getCachedOrFetch } from '~~/server/utils/cache'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { selfhostDeploymentTable } from '#layers/selfhost/server/db/schema'
import { getLatestVersion } from '#layers/selfhost/server/services/github'

const LATEST_VERSION_CACHE_TTL_SECONDS = 3600

export default defineAuthorizedHandler(['selfhost:read', 'selfhost:manage'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId!
  const deployment = await db.query.selfhostDeploymentTable.findFirst({
    where: eq(selfhostDeploymentTable.organization_id, orgId),
  })

  const repo = useRuntimeConfig().githubRepository
  const latest_version = repo
    ? await getCachedOrFetch(`selfhost:latest-version`, () => getLatestVersion(repo), LATEST_VERSION_CACHE_TTL_SECONDS)
    : null

  if (!deployment)
    return { status: 'idle' as const, latest_version, update_available: false, has_stored_token: false }

  // Strip token ciphertext + IV before returning to the client.
  const { cf_token_ciphertext, cf_token_iv, ...safe } = deployment
  return {
    ...safe,
    latest_version,
    update_available: !!(latest_version && deployment.deployed_version && latest_version !== deployment.deployed_version),
    has_stored_token: !!(cf_token_ciphertext && cf_token_iv),
  }
})
