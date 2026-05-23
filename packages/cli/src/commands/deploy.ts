import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { ensureR2Bucket, PREVIEW_NAMES, PROD_NAMES, resolveOrCreateD1, resolveOrCreateKv, verifyToken } from '../lib/cloudflare'
import { effectiveEnv, GH_VARIABLES, resolveCfToken, workerRuntimeSecrets } from '../lib/env'
import { ghAuthStatus, setSecret, setVariable } from '../lib/github'
import { generateSecret } from '../lib/keys'
import { run } from '../lib/run'

const WORKER_NAME = 'nuxt-template'

const setup = defineCommand({
  meta: { name: 'setup', description: 'Provision CF resources + sync GitHub config + push Worker secrets' },
  args: {
    'env': { type: 'string', description: 'production | preview | all', default: 'production' },
    'dry-run': { type: 'boolean', description: 'Print the plan, mutate nothing', default: false },
    'skip-worker-secrets': { type: 'boolean', default: false },
  },
  async run({ args }) {
    const dry = args['dry-run']
    const env = effectiveEnv()
    const log = (s: string) => console.log(`${dry ? '[dry] ' : ''}${s}`)

    const { token, source } = resolveCfToken(env)
    if (!token)
      throw new Error('No Cloudflare token (set CLOUDFLARE_API_TOKEN). Run `harness doctor`.')
    const v = await verifyToken(token)
    if (!v.valid)
      throw new Error(`Cloudflare token (${source}) invalid: ${v.detail}`)
    const accountId = env.CLOUDFLARE_ACCOUNT_ID
    if (!accountId)
      throw new Error('CLOUDFLARE_ACCOUNT_ID is required (set it in .env or the shell).')
    const gh = await ghAuthStatus()
    if (!gh.authed)
      throw new Error('GitHub CLI not authenticated. Run `gh auth login`.')

    const wantProd = args.env === 'production' || args.env === 'all'
    const wantPreview = args.env === 'preview' || args.env === 'all'
    const vars: Record<string, string> = { CLOUDFLARE_ACCOUNT_ID: accountId }

    if (wantProd) {
      if (dry) {
        log(`would create/resolve D1=${PROD_NAMES.d1}, KV=${PROD_NAMES.kv}, CACHE=${PROD_NAMES.cache}, R2=${PROD_NAMES.r2}`)
      }
      else {
        vars.CLOUDFLARE_D1_DATABASE_ID = await resolveOrCreateD1(PROD_NAMES.d1)
        vars.CLOUDFLARE_KV_NAMESPACE_ID = await resolveOrCreateKv(PROD_NAMES.kv)
        vars.CLOUDFLARE_CACHE_NAMESPACE_ID = await resolveOrCreateKv(PROD_NAMES.cache)
        vars.CLOUDFLARE_R2_BUCKET = await ensureR2Bucket(PROD_NAMES.r2)
        log(`resolved prod: D1=${vars.CLOUDFLARE_D1_DATABASE_ID} KV=${vars.CLOUDFLARE_KV_NAMESPACE_ID} CACHE=${vars.CLOUDFLARE_CACHE_NAMESPACE_ID} R2=${vars.CLOUDFLARE_R2_BUCKET}`)
      }
    }

    if (wantPreview) {
      if (dry) {
        log(`would create/resolve preview KV=${PREVIEW_NAMES.kv}, CACHE=${PREVIEW_NAMES.cache}, R2=${PREVIEW_NAMES.r2}`)
      }
      else {
        vars.CLOUDFLARE_PREVIEW_KV_NAMESPACE_ID = await resolveOrCreateKv(PREVIEW_NAMES.kv)
        vars.CLOUDFLARE_PREVIEW_CACHE_NAMESPACE_ID = await resolveOrCreateKv(PREVIEW_NAMES.cache)
        vars.CLOUDFLARE_PREVIEW_R2_BUCKET = await ensureR2Bucket(PREVIEW_NAMES.r2)
      }
    }

    for (const name of GH_VARIABLES) {
      const value = vars[name]
      if (!value)
        continue
      if (dry)
        log(`would set gh variable ${name}`)
      else
        log(`gh variable ${name}: ${await setVariable(name, value) ? 'set' : 'FAILED'}`)
    }

    if (dry) {
      log('would set gh secret CLOUDFLARE_API_TOKEN, PREVIEW_NUXT_AUTH_SECRET')
    }
    else {
      log(`gh secret CLOUDFLARE_API_TOKEN: ${await setSecret('CLOUDFLARE_API_TOKEN', token) ? 'set' : 'FAILED'}`)
      const previewSecret = env.PREVIEW_NUXT_AUTH_SECRET || generateSecret()
      log(`gh secret PREVIEW_NUXT_AUTH_SECRET: ${await setSecret('PREVIEW_NUXT_AUTH_SECRET', previewSecret) ? 'set' : 'FAILED'}`)
    }

    if (wantProd && !args['skip-worker-secrets']) {
      const secrets = workerRuntimeSecrets()
      const names = Object.keys(secrets)
      if (names.length === 0) {
        log('no NUXT_*/CRON_SECRET found in .env — skipping Worker secret push')
      }
      else if (dry) {
        log(`would push ${names.length} Worker secrets to "${WORKER_NAME}": ${names.join(', ')}`)
      }
      else {
        const file = join(tmpdir(), `harness-worker-secrets-${Date.now()}.json`)
        writeFileSync(file, JSON.stringify(secrets), 'utf8')
        const res = await run('npx', ['--yes', 'wrangler', 'secret', 'bulk', file, '--name', WORKER_NAME])
        log(`wrangler secret bulk → ${WORKER_NAME}: ${res.code === 0 ? 'ok' : `FAILED ${res.stderr}`}`)
        try {
          (await import('node:fs')).rmSync(file)
        }
        catch {}
      }
    }

    log('deploy setup complete.')
  },
})

const status = defineCommand({
  meta: { name: 'status', description: 'Latest CI/Production run + Worker deployments' },
  async run() {
    const runs = await run('gh', ['run', 'list', '--workflow', 'Production', '--limit', '5'])
    console.log(runs.stdout || runs.stderr)
    const deps = await run('npx', ['--yes', 'wrangler', 'deployments', 'list', '--name', WORKER_NAME])
    console.log(deps.stdout || deps.stderr)
  },
})

const logs = defineCommand({
  meta: { name: 'logs', description: 'Tail the production Worker (wrangler tail)' },
  async run() {
    const { spawn } = await import('node:child_process')
    const bin = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    spawn(bin, ['--yes', 'wrangler', 'tail', '--name', WORKER_NAME], { stdio: 'inherit', shell: false })
  },
})

export const deploy = defineCommand({
  meta: { name: 'deploy', description: 'Configure deploys (CI owns the actual deploy)' },
  subCommands: { setup, status, logs },
})
