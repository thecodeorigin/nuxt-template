/**
 * Compute the Redis key-base prefix for the current environment so a single
 * Upstash instance can safely back multiple Vercel deployments without key
 * collisions between production / preview / local.
 *
 * Examples:
 *   production           → "redis:prod"
 *   preview branch foo   → "redis:preview:foo"
 *   local dev            → "redis:local"
 *   explicit override    → process.env.NUXT_REDIS_BASE wins
 */
export function getRedisBase(): string {
  const explicit = process.env.NUXT_REDIS_BASE
  if (explicit && explicit.length > 0)
    return explicit

  const env = process.env.VERCEL_ENV
  if (env === 'production')
    return 'redis:prod'

  if (env === 'preview') {
    const branch = process.env.VERCEL_GIT_COMMIT_REF ?? 'unknown'
    return `redis:preview:${slugifyBranch(branch)}`
  }

  return 'redis:local'
}

function slugifyBranch(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'unknown'
}
