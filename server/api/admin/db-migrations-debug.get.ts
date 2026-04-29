/**
 * Dev-only diagnostic that shows what the runtime can see at the
 * `assets:db-migrations` storage namespace. Used once to confirm the
 * serverAssets bundling works — safe to remove afterwards.
 */
export default defineEventHandler(async () => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true')
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const namespaces = [
    'assets:db-migrations',
    'assets:server',
    'assets:template',
    'assets',
    '/assets',
    '/assets/db-migrations',
    '/assets/server',
    '/assets/template',
  ]
  const out: Record<string, unknown> = {}

  for (const ns of namespaces) {
    try {
      const storage = useStorage(ns)
      const keys = await storage.getKeys()
      out[ns] = { keyCount: keys.length, keys: keys.slice(0, 20) }
    }
    catch (err) {
      out[ns] = { error: (err as Error).message }
    }
  }

  // Also probe the unified root storage
  try {
    const root = useStorage()
    const allKeys = await root.getKeys()
    out['_root'] = {
      keyCount: allKeys.length,
      withAssetPrefix: allKeys.filter((k: string) => k.includes('assets')).slice(0, 20),
      first20: allKeys.slice(0, 20),
    }
  }
  catch (err) {
    out._root = { error: (err as Error).message }
  }

  return out
})
