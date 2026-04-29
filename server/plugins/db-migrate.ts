/**
 * Runs `db:migrate` once per Nitro instance on startup. Skipping criteria:
 *   - explicitly disabled via NUXT_AUTO_MIGRATE=false
 *   - already executed for this instance (module-level flag)
 *   - no NUXT_POSTGRES_URL configured (e.g. local dev without a DB)
 *
 * The underlying task is idempotent (tracks state in __migrations), so a
 * cold start that runs it again after a successful first run is a no-op
 * apart from one SELECT.
 */

let didRun = false

export default defineNitroPlugin(async (_nitroApp) => {
  if (didRun)
    return

  if (process.env.NUXT_AUTO_MIGRATE === 'false')
    return

  const config = useRuntimeConfig()
  if (!config.postgresUrl)
    return

  try {
    const { result } = (await runTask('db:migrate')) as { result: { applied: string[], skipped: string[] } }
    didRun = true
    if (result.applied.length > 0)
      console.log(`[db-migrate] applied ${result.applied.length} migration(s):`, result.applied)
    else
      console.log(`[db-migrate] no pending migrations (${result.skipped.length} already applied)`)
  }
  catch (err) {
    console.error('[db-migrate] failed:', err)
  }
})
