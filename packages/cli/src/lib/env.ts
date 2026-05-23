import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'dotenv'

export const ENV_PATH = join(process.cwd(), '.env')
export const ENV_EXAMPLE_PATH = join(process.cwd(), '.env.example')

export function readEnvFile(path = ENV_PATH): Record<string, string> {
  if (!existsSync(path))
    return {}
  return parse(readFileSync(path, 'utf8'))
}

export function effectiveEnv(): Record<string, string | undefined> {
  return { ...process.env, ...readEnvFile() }
}

export const AUTH_SECRETS = ['NUXT_AUTH_SECRET', 'NUXT_TASK_SECRET', 'NUXT_WEBHOOK_SIGNING_SECRET'] as const
export const GITHUB_OAUTH = ['NUXT_GITHUB_CLIENT_ID', 'NUXT_GITHUB_CLIENT_SECRET'] as const
export const GOOGLE_OAUTH = ['NUXT_GOOGLE_CLIENT_ID', 'NUXT_GOOGLE_CLIENT_SECRET'] as const
export const SMTP_KEYS = ['NUXT_SMTP_HOST', 'NUXT_SMTP_PORT', 'NUXT_SMTP_FROM'] as const

export const CF_TOKEN_VARS = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_TOKEN', 'NUXT_HUB_CLOUDFLARE_API_TOKEN'] as const
export const CF_LEGACY_KEY_VAR = 'CLOUDFLARE_API_KEY'

export function resolveCfToken(env = effectiveEnv()): { token?: string, source?: string } {
  for (const v of CF_TOKEN_VARS) {
    if (env[v])
      return { token: env[v], source: v }
  }
  return {}
}

export const GH_VARIABLES = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_D1_DATABASE_ID',
  'CLOUDFLARE_KV_NAMESPACE_ID',
  'CLOUDFLARE_CACHE_NAMESPACE_ID',
  'CLOUDFLARE_R2_BUCKET',
  'CLOUDFLARE_PREVIEW_KV_NAMESPACE_ID',
  'CLOUDFLARE_PREVIEW_CACHE_NAMESPACE_ID',
  'CLOUDFLARE_PREVIEW_R2_BUCKET',
] as const

export const GH_SECRETS = ['CLOUDFLARE_API_TOKEN', 'PREVIEW_NUXT_AUTH_SECRET'] as const

export function workerRuntimeSecrets(env = readEnvFile()): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(env)) {
    if (!v)
      continue
    if (k.startsWith('NUXT_') || k === 'CRON_SECRET')
      out[k] = v
  }
  return out
}
