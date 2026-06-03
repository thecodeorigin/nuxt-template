import { db } from '@nuxthub/db'
import { organizationTable, selfhostAuditTable, selfhostDeploymentSecretTable, selfhostDeploymentTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { eq } from 'drizzle-orm'
import { readValidatedBody } from 'h3'
import { decryptSecret, encryptSecret } from '~~/server/utils/crypto'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { applyMigrations, enableSubdomain, listAccounts, probeCapabilities, provisionResources, setWorkerSecret, uploadAssets, uploadWorker, verifyToken } from '#layers/selfhost/server/services/cloudflare'
import { getLatestBundle } from '#layers/selfhost/server/services/github'
import { generateAutoSecret, SELFHOST_SECRET_CATALOG } from '#layers/selfhost/server/services/secrets'
import { DeployBodySchema } from '#layers/selfhost/shared/schemas/deploy'

const RATE_LIMIT_SECONDS = 60
const CONCURRENT_DEPLOY_WINDOW_MS = 5 * 60_000

export default defineAuthorizedHandler(['selfhost:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId!
  const body = await readValidatedBody(event, DeployBodySchema.parse)
  const startedAt = new Date()

  // Owner-only gate: a CF API token is account-takeover-grade, so only the org owner may bind one.
  const org = await db.query.organizationTable.findFirst({ where: eq(organizationTable.id, orgId) })
  if (!org || org.owner_id !== session.id)
    throw createError({ statusCode: 403, statusMessage: 'Only the organization owner can deploy a self-hosted instance' })

  // Rate limit (one deploy attempt per minute per org)
  const rlKey = `selfhost:deploy-rl:${orgId}`
  if (await kv.has(rlKey))
    throw createError({ statusCode: 429, statusMessage: `Deploy attempted too recently. Wait ${RATE_LIMIT_SECONDS}s.` })
  await kv.set(rlKey, 1, { ttl: RATE_LIMIT_SECONDS })

  // Concurrent-deploy guard (skip if a prior run is still within the 5-minute window)
  const existing = await db.query.selfhostDeploymentTable.findFirst({
    where: eq(selfhostDeploymentTable.organization_id, orgId),
  })
  if (existing?.status === 'deploying' && existing.deployed_at && Date.now() - existing.deployed_at.getTime() < CONCURRENT_DEPLOY_WINDOW_MS)
    throw createError({ statusCode: 409, statusMessage: 'Another deploy is already in progress' })

  // Resolve the CF token: either pasted in the request body, or decrypt the stored one for a redeploy.
  let cfToken: string
  if (body.token) {
    cfToken = body.token
  }
  else {
    if (!existing?.cf_token_ciphertext || !existing?.cf_token_iv)
      throw createError({ statusCode: 400, statusMessage: 'No token provided and no stored token found' })
    cfToken = await decryptSecret({ ciphertext: existing.cf_token_ciphertext, iv: existing.cf_token_iv })
  }

  const action = existing?.deployed_version ? 'redeploy' : 'deploy'

  await db.insert(selfhostDeploymentTable)
    .values({ organization_id: orgId, status: 'deploying', deployed_at: startedAt })
    .onConflictDoUpdate({
      target: selfhostDeploymentTable.organization_id,
      set: { status: 'deploying', last_error: null, deployed_at: startedAt },
    })

  let cfAccountId: string | null = null

  try {
    // 1. Verify token
    const tokenInfo = await verifyToken(cfToken)

    // 2. Resolve which Cloudflare account to deploy into.
    //    Priority: explicit body.account_id > stored cf_account_id (redeploy) > the single account on the token.
    //    If the token can see multiple accounts and no choice was made, refuse so the UI can prompt.
    if (body.account_id) {
      const accounts = await listAccounts(cfToken)
      if (!accounts.some(a => a.id === body.account_id))
        throw createError({ statusCode: 400, statusMessage: 'Selected account_id is not reachable by the provided token' })
      cfAccountId = body.account_id
    }
    else if (existing?.cf_account_id) {
      cfAccountId = existing.cf_account_id
    }
    else {
      const accounts = await listAccounts(cfToken)
      if (accounts.length > 1) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Multiple Cloudflare accounts available — choose one before deploying',
          data: { code: 'multiple_accounts', accounts },
        })
      }
      cfAccountId = accounts[0]!.id
    }

    // 3. Write-capable capability probe
    const missing = await probeCapabilities(cfToken, cfAccountId)
    if (missing.length)
      throw createError({ statusCode: 400, statusMessage: `Token missing permissions: ${missing.join(', ')}` })

    // 4. Provision resources
    const resources = await provisionResources(cfToken, cfAccountId)

    // 5. Fetch bundle from GitHub release
    const repo = useRuntimeConfig().githubRepository
    if (!repo)
      throw createError({ statusCode: 500, statusMessage: 'githubRepository runtime config not set' })
    const { version, bundle } = await getLatestBundle(repo)

    // 6. Apply migrations
    await applyMigrations(cfToken, cfAccountId, resources.dbId, bundle.migrations)

    // 7. Upload Worker + static assets + enable subdomain
    const scriptName = `nuxt-template-${orgId.slice(0, 8)}`.slice(0, 63)
    const assetsJwt = bundle.assets ? await uploadAssets(cfToken, cfAccountId, scriptName, bundle.assets) : null
    await uploadWorker(cfToken, cfAccountId, scriptName, bundle, resources, version, assetsJwt)
    const workerUrl = await enableSubdomain(cfToken, cfAccountId, scriptName)

    // 7b. Push secrets to the new Worker. Auto-generated ones are created once and persisted so
    //     redeploys reuse the same value (rotating auth secrets would log every user out).
    const autoCtx = { workersDevUrl: workerUrl, releaseRepo: repo }
    for (const def of SELFHOST_SECRET_CATALOG) {
      if (!def.auto)
        continue
      const value = generateAutoSecret(def, autoCtx)
      if (!value)
        continue
      const enc = await encryptSecret(value)
      await db.insert(selfhostDeploymentSecretTable)
        .values({ organization_id: orgId, key: def.key, ciphertext: enc.ciphertext, iv: enc.iv })
        .onConflictDoNothing({ target: [selfhostDeploymentSecretTable.organization_id, selfhostDeploymentSecretTable.key] })
    }

    const storedSecrets = await db.query.selfhostDeploymentSecretTable.findMany({
      where: eq(selfhostDeploymentSecretTable.organization_id, orgId),
    })
    for (const row of storedSecrets) {
      const def = SELFHOST_SECRET_CATALOG.find(d => d.key === row.key)
      if (!def)
        continue
      const value = await decryptSecret({ ciphertext: row.ciphertext, iv: row.iv })
      await setWorkerSecret(cfToken, cfAccountId, scriptName, row.key, value, def.type)
    }

    // 8. Persist deployment + encrypted token
    const enc = await encryptSecret(cfToken)
    const expires = tokenInfo.expires_on ? new Date(tokenInfo.expires_on) : null
    await db.update(selfhostDeploymentTable)
      .set({
        cf_account_id: cfAccountId,
        cf_script_name: scriptName,
        workers_dev_url: workerUrl,
        deployed_version: version,
        deployed_at: new Date(),
        status: 'deployed',
        cf_token_ciphertext: enc.ciphertext,
        cf_token_iv: enc.iv,
        cf_token_expires_at: expires ?? undefined,
        last_error: null,
      })
      .where(eq(selfhostDeploymentTable.organization_id, orgId))

    await db.insert(selfhostAuditTable).values({
      organization_id: orgId,
      actor_user_id: session.id,
      action,
      success: true,
      cf_account_id: cfAccountId,
      started_at: startedAt,
      finished_at: new Date(),
    })

    return { url: workerUrl, version }
  }
  catch (e: unknown) {
    const message = ((e as { statusMessage?: string, message?: string })?.statusMessage
      ?? (e as { message?: string })?.message
      ?? 'Unknown error').slice(0, 500)

    await db.update(selfhostDeploymentTable)
      .set({ status: 'failed', last_error: message })
      .where(eq(selfhostDeploymentTable.organization_id, orgId))

    await db.insert(selfhostAuditTable).values({
      organization_id: orgId,
      actor_user_id: session.id,
      action,
      success: false,
      cf_account_id: cfAccountId,
      error_message: message,
      started_at: startedAt,
      finished_at: new Date(),
    })

    throw e
  }
})
