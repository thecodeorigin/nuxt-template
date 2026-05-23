import type { Runner } from './run'
import { run } from './run'

export interface CfResources {
  d1DatabaseId: string
  kvNamespaceId: string
  cacheNamespaceId: string
  r2Bucket: string
}

function W(runner: Runner) {
  return (args: string[]) => runner('npx', ['--yes', 'wrangler', ...args], {
    env: process.env,
  })
}

export async function resolveOrCreateD1(name: string, runner: Runner = run): Promise<string> {
  const w = W(runner)
  await w(['d1', 'create', name])
  const info = await w(['d1', 'info', name, '--json'])
  const id = safeJson<{ uuid?: string }>(info.stdout)?.uuid
  if (!id)
    throw new Error(`Could not resolve D1 id for "${name}": ${info.stderr || info.stdout}`)
  return id
}

export async function resolveOrCreateKv(title: string, runner: Runner = run): Promise<string> {
  const w = W(runner)
  const list = await w(['kv', 'namespace', 'list'])
  const existing = safeJson<Array<{ id: string, title: string }>>(list.stdout)?.find(n => n.title === title)
  if (existing)
    return existing.id
  const created = await w(['kv', 'namespace', 'create', title])
  const after = await w(['kv', 'namespace', 'list'])
  const found = safeJson<Array<{ id: string, title: string }>>(after.stdout)?.find(n => n.title === title)
  if (!found)
    throw new Error(`Created KV "${title}" but could not resolve its id: ${created.stdout}`)
  return found.id
}

export async function ensureR2Bucket(name: string, runner: Runner = run): Promise<string> {
  await W(runner)(['r2', 'bucket', 'create', name])
  return name
}

export async function verifyToken(token: string): Promise<{ valid: boolean, detail: string }> {
  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { authorization: `Bearer ${token}` },
    })
    const body = await res.json() as { success?: boolean, result?: { status?: string } }
    if (body.success && body.result?.status === 'active')
      return { valid: true, detail: 'token active' }
    return { valid: false, detail: `token not active (${res.status})` }
  }
  catch (err) {
    return { valid: false, detail: `verify failed: ${String(err)}` }
  }
}

function safeJson<T>(s: string): T | undefined {
  try {
    return JSON.parse(s) as T
  }
  catch {
    return undefined
  }
}

export const PROD_NAMES = {
  d1: 'nuxt-template-prod-db',
  kv: 'nuxt-template-prod-kv',
  cache: 'nuxt-template-prod-cache',
  r2: 'nuxt-template-prod',
} as const

export const PREVIEW_NAMES = {
  kv: 'nuxt-template-preview-kv',
  cache: 'nuxt-template-preview-cache',
  r2: 'nuxt-template-preview',
} as const
