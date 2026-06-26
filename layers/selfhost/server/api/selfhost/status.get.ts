import { db } from '@nuxthub/db'
import { selfhostDeploymentTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { getCachedOrFetch } from '~~/server/utils/cache'
import { getLatestVersion } from '#layers/selfhost/server/services/github'

const LATEST_VERSION_CACHE_TTL_SECONDS = 3600

export default defineAdminHandler(['selfhost:read', 'selfhost:manage'], async (_event, { session }) => {
  const orgId = session.activeOrg!
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
