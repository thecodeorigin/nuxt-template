import type { Check } from '../lib/output'
import { defineCommand } from 'citty'
import { verifyToken } from '../lib/cloudflare'
import {
  AUTH_SECRETS,
  CF_LEGACY_KEY_VAR,
  effectiveEnv,
  GH_SECRETS,
  GH_VARIABLES,
  GITHUB_OAUTH,
  GOOGLE_OAUTH,
  resolveCfToken,
} from '../lib/env'
import { ghAuthStatus, ghRepo, listConfiguredNames, missingConfig } from '../lib/github'
import { exitFromChecks, printChecks, printJson } from '../lib/output'
import { detectTools } from '../lib/tools'

export const doctor = defineCommand({
  meta: { name: 'doctor', description: 'Diagnose the harness environment' },
  args: {
    json: { type: 'boolean', description: 'Machine-readable output', default: false },
  },
  async run({ args }) {
    const env = effectiveEnv()
    const checks: Check[] = []

    const tools = await detectTools()
    for (const t of tools) {
      const required = t.name === 'node' || t.name === 'npx'
      checks.push({
        name: `tool:${t.name}`,
        status: t.present ? 'ok' : required ? 'fail' : 'warn',
        detail: t.present ? (t.version ?? 'present') : 'not found',
        fix: t.present ? undefined : `install ${t.name}`,
      })
    }

    const { token, source } = resolveCfToken(env)
    if (token) {
      const v = await verifyToken(token)
      checks.push({
        name: 'cloudflare:token',
        status: v.valid ? 'ok' : 'fail',
        detail: `${source}: ${v.detail}`,
        fix: v.valid ? undefined : 'create a scoped token (Workers+D1+KV+R2) and set CLOUDFLARE_API_TOKEN',
      })
    }
    else if (env[CF_LEGACY_KEY_VAR]) {
      checks.push({
        name: 'cloudflare:token',
        status: 'warn',
        detail: `only ${CF_LEGACY_KEY_VAR} (legacy global key) present`,
        fix: 'prefer a scoped CLOUDFLARE_API_TOKEN',
      })
    }
    else {
      checks.push({ name: 'cloudflare:token', status: 'fail', detail: 'no CF token in env or .env', fix: 'set CLOUDFLARE_API_TOKEN' })
    }
    checks.push({
      name: 'cloudflare:account',
      status: env.CLOUDFLARE_ACCOUNT_ID ? 'ok' : 'warn',
      detail: env.CLOUDFLARE_ACCOUNT_ID ? 'CLOUDFLARE_ACCOUNT_ID set' : 'CLOUDFLARE_ACCOUNT_ID unset',
      fix: env.CLOUDFLARE_ACCOUNT_ID ? undefined : 'set CLOUDFLARE_ACCOUNT_ID (needed by deploy setup)',
    })

    const gh = await ghAuthStatus()
    checks.push({ name: 'github:auth', status: gh.authed ? 'ok' : 'warn', detail: gh.detail || 'not authenticated', fix: gh.authed ? undefined : 'gh auth login' })
    if (gh.authed) {
      const repo = await ghRepo()
      checks.push({ name: 'github:repo', status: repo ? 'ok' : 'warn', detail: repo ?? 'no repo detected' })
      const cfg = await listConfiguredNames()
      const missingVars = missingConfig(cfg.variables, GH_VARIABLES)
      const missingSecrets = missingConfig(cfg.secrets, GH_SECRETS)
      checks.push({
        name: 'github:variables',
        status: missingVars.length === 0 ? 'ok' : 'warn',
        detail: missingVars.length === 0 ? 'all set' : `missing: ${missingVars.join(', ')}`,
        fix: missingVars.length === 0 ? undefined : 'harness deploy setup',
      })
      checks.push({
        name: 'github:secrets',
        status: missingSecrets.length === 0 ? 'ok' : 'warn',
        detail: missingSecrets.length === 0 ? 'all set' : `missing: ${missingSecrets.join(', ')}`,
        fix: missingSecrets.length === 0 ? undefined : 'harness deploy setup',
      })
    }

    const gcloud = tools.find(t => t.name === 'gcloud')
    checks.push({ name: 'google:gcloud', status: gcloud?.present ? 'ok' : 'skip', detail: gcloud?.present ? (gcloud.version ?? 'present') : 'not installed (optional)' })

    pushPresence(checks, env, 'oauth:github', GITHUB_OAUTH)
    pushPresence(checks, env, 'oauth:google', GOOGLE_OAUTH)
    pushPresence(checks, env, 'env:auth-secrets', AUTH_SECRETS, { fix: 'harness dev setup' })

    if (args.json)
      printJson({ checks, ok: !checks.some(c => c.status === 'fail') })
    else
      printChecks(checks)

    exitFromChecks(checks)
  },
})

function pushPresence(
  checks: Check[],
  env: Record<string, string | undefined>,
  name: string,
  keys: readonly string[],
  opts: { fix?: string } = {},
): void {
  const missing = keys.filter(k => !env[k])
  checks.push({
    name,
    status: missing.length === 0 ? 'ok' : 'warn',
    detail: missing.length === 0 ? 'present' : `missing: ${missing.join(', ')}`,
    fix: missing.length === 0 ? undefined : opts.fix,
  })
}
