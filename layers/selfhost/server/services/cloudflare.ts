import { createError } from 'h3'

const BASE = 'https://api.cloudflare.com/client/v4'

interface CfEnvelope<T = unknown> { success: boolean, result: T, errors?: { message: string }[] }

async function cf<T = any>(token: string, method: string, path: string, body?: unknown): Promise<CfEnvelope<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<CfEnvelope<T>>
}

async function cfRaw(token: string, method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export interface TokenInfo {
  status: 'active' | 'disabled' | 'expired'
  expires_on?: string | null
}

export async function verifyToken(token: string): Promise<TokenInfo> {
  const r = await cf<TokenInfo>(token, 'GET', '/user/tokens/verify')
  if (r?.result?.status !== 'active')
    throw createError({ statusCode: 400, statusMessage: 'Token is not active' })
  return r.result
}

export interface CloudflareAccount { id: string, name: string }

export async function listAccounts(token: string): Promise<CloudflareAccount[]> {
  const r = await cf<CloudflareAccount[]>(token, 'GET', '/accounts')
  if (!r?.result?.length)
    throw createError({ statusCode: 400, statusMessage: 'Token has no account access' })
  return r.result.map(a => ({ id: a.id, name: a.name }))
}

// Single-account convenience for tokens scoped to exactly one account.
export async function discoverAccount(token: string): Promise<string> {
  const accounts = await listAccounts(token)
  return accounts[0]!.id
}

// Write-capable capability probe. POSTs a sentinel resource then deletes it.
// A read-only token will fail POST with 403 even when GET returns 200, so a
// pure-read probe is insufficient — see plan §3.2.
export async function probeCapabilities(token: string, accountId: string): Promise<string[]> {
  const nonce = `_probe-${Date.now().toString(36)}`
  const missing: string[] = []

  // Workers Scripts: try a HEAD on the listing endpoint with write-like content-type.
  // A pure POST creates a script which is overkill — list-with-write-perm is signalled by 200 on GET.
  // Cloudflare returns 403 on GET for read-only tokens too, so we test PUT of an empty module then DELETE.
  {
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify({ main_module: 'index.mjs', compatibility_date: '2025-01-01' })], { type: 'application/json' }))
    form.append('index.mjs', new Blob(['export default { fetch: () => new Response("") }'], { type: 'application/javascript+module' }), 'index.mjs')
    const put = await fetch(`${BASE}/accounts/${accountId}/workers/scripts/${nonce}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (put.status === 403)
      missing.push('Workers Scripts')
    else if (put.ok)
      await cfRaw(token, 'DELETE', `/accounts/${accountId}/workers/scripts/${nonce}`)
  }

  // D1
  {
    const create = await cf<{ uuid: string }>(token, 'POST', `/accounts/${accountId}/d1/database`, { name: nonce })
    if (!create?.success && JSON.stringify(create).includes('forbidden'))
      missing.push('D1')
    else if (create?.success)
      await cfRaw(token, 'DELETE', `/accounts/${accountId}/d1/database/${create.result.uuid}`)
  }

  // KV
  {
    const create = await cf<{ id: string }>(token, 'POST', `/accounts/${accountId}/storage/kv/namespaces`, { title: nonce })
    if (!create?.success && JSON.stringify(create).includes('forbidden'))
      missing.push('KV')
    else if (create?.success)
      await cfRaw(token, 'DELETE', `/accounts/${accountId}/storage/kv/namespaces/${create.result.id}`)
  }

  // R2 — distinguish between (a) missing permission, (b) R2 not enabled on the account, (c) success.
  {
    const create = await cf<unknown>(token, 'POST', `/accounts/${accountId}/r2/buckets`, { name: nonce })
    if (create?.success) {
      await cfRaw(token, 'DELETE', `/accounts/${accountId}/r2/buckets/${nonce}`)
    }
    else {
      const msg = JSON.stringify(create).toLowerCase()
      if (msg.includes('forbidden'))
        missing.push('R2')
      else if (/not enabled|subscription|terms/.test(msg))
        missing.push('R2 (not enabled on account — accept R2 terms in CF dashboard first)')
    }
  }

  // Workers Subdomain: read-only is fine here; the actual enable happens at deploy time.
  {
    const sub = await cfRaw(token, 'GET', `/accounts/${accountId}/workers/subdomain`)
    if (sub.status === 403)
      missing.push('Workers Subdomain')
  }

  return missing
}

async function ensureResource(token: string, path: string, body: Record<string, unknown>, idKey: string): Promise<string | null> {
  const create = await cf<Record<string, unknown>>(token, 'POST', path, body)
  if (create?.success)
    return create.result[idKey] as string
  const list = await cf<Record<string, unknown>[]>(token, 'GET', path)
  const found = list?.result?.find((r: Record<string, unknown>) => r.name === body.name || r.title === body.title)
  return (found?.[idKey] ?? null) as string | null
}

export interface ProvisionedResources { dbId: string, kvId: string, bucketName: string }

async function ensureR2Bucket(token: string, accountId: string, name: string): Promise<void> {
  const create = await cf<unknown>(token, 'POST', `/accounts/${accountId}/r2/buckets`, { name })
  if (create?.success)
    return

  // Already exists? R2's list response shape is { result: { buckets: [...] } }, not { result: [...] }.
  const list = await cf<{ buckets?: { name: string }[] }>(token, 'GET', `/accounts/${accountId}/r2/buckets`)
  const exists = list?.result?.buckets?.some(b => b.name === name)
  if (exists)
    return

  // Try to surface a useful reason. The most common cause is R2 not being enabled on the account
  // (Cloudflare requires a one-time ToS acceptance + plan selection before any bucket can be created).
  const firstError = create?.errors?.[0]?.message ?? 'Unknown reason'
  const hint = /not enabled|subscription|terms/i.test(firstError)
    ? ' — open the R2 dashboard and enable R2 (free tier is fine), then retry.'
    : ''
  throw createError({ statusCode: 502, statusMessage: `Failed to create R2 bucket '${name}': ${firstError}${hint}` })
}

export async function provisionResources(token: string, accountId: string, prefix = 'nuxt-template'): Promise<ProvisionedResources> {
  const dbId = await ensureResource(token, `/accounts/${accountId}/d1/database`, { name: `${prefix}-db` }, 'uuid')
  const kvId = await ensureResource(token, `/accounts/${accountId}/storage/kv/namespaces`, { title: `${prefix}-kv` }, 'id')
  await ensureR2Bucket(token, accountId, `${prefix}-blob`)

  if (!dbId || !kvId)
    throw createError({ statusCode: 502, statusMessage: 'Failed to provision required resources (D1 or KV)' })

  return { dbId, kvId, bucketName: `${prefix}-blob` }
}

export async function applyMigrations(token: string, accountId: string, dbId: string, migrations: { name: string, sql: string }[]): Promise<void> {
  await cf(token, 'POST', `/accounts/${accountId}/d1/database/${dbId}/query`, {
    sql: 'CREATE TABLE IF NOT EXISTS d1_migrations (name TEXT PRIMARY KEY, applied_at TEXT)',
  })

  for (const m of migrations) {
    const check = await cf<{ results: unknown[] }[]>(token, 'POST', `/accounts/${accountId}/d1/database/${dbId}/query`, {
      sql: 'SELECT name FROM d1_migrations WHERE name = ?',
      params: [m.name],
    })
    if (check?.result?.[0]?.results?.length)
      continue
    await cf(token, 'POST', `/accounts/${accountId}/d1/database/${dbId}/query`, { sql: m.sql })
    await cf(token, 'POST', `/accounts/${accountId}/d1/database/${dbId}/query`, {
      sql: `INSERT INTO d1_migrations (name, applied_at) VALUES (?, datetime())`,
      params: [m.name],
    })
  }
}

export interface UploadWorkerBundle {
  main: string
  compatibilityDate: string
  modules: Record<string, string>
}

const MIME_BY_EXT: Record<string, string> = {
  js: 'application/javascript',
  mjs: 'application/javascript',
  cjs: 'application/javascript',
  css: 'text/css',
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  json: 'application/json',
  map: 'application/json',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  eot: 'application/vnd.ms-fontobject',
  wasm: 'application/wasm',
  pdf: 'application/pdf',
  webmanifest: 'application/manifest+json',
}

function mimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

// Uploads .output/public/* to Cloudflare Workers Static Assets and returns the completion JWT
// that uploadWorker must include in its metadata. Three-call protocol: start session → upload
// the buckets CF doesn't already have → final response carries the token to embed.
export async function uploadAssets(
  token: string,
  accountId: string,
  scriptName: string,
  assets: Record<string, string>,
): Promise<string | null> {
  const entries = Object.entries(assets)
  if (entries.length === 0)
    return null

  const manifest: Record<string, { hash: string, size: number }> = {}
  // Keep the original base64 keyed by hash — we ship base64 to CF anyway (?base64=true), so re-encoding
  // (bytes → fromCharCode spread → btoa) is wasted CPU AND blows the V8 argument stack on files > ~64 KB.
  const b64ByHash: Record<string, string> = {}
  // CF serves each asset back using the Content-Type we set during multipart upload, NOT the manifest
  // path's extension. So we infer MIME here and pass it to the Blob.
  const mimeByHash: Record<string, string> = {}
  for (const [path, b64] of entries) {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const hashBuf = await crypto.subtle.digest('SHA-256', bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer)
    const hash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
    manifest[path] = { hash, size: bytes.byteLength }
    b64ByHash[hash] = b64
    mimeByHash[hash] = mimeFromPath(path)
  }

  const session = await cf<{ jwt: string, buckets: string[][] }>(
    token,
    'POST',
    `/accounts/${accountId}/workers/scripts/${scriptName}/assets-upload-session`,
    { manifest },
  )
  if (!session?.success || !session.result)
    throw createError({ statusCode: 502, statusMessage: `Failed to start assets upload session: ${session?.errors?.[0]?.message ?? 'unknown'}` })

  // If CF already has every file by hash, buckets will be empty arrays — we still need the JWT.
  let completionJwt = session.result.jwt
  const buckets = session.result.buckets ?? []

  for (const bucket of buckets) {
    if (bucket.length === 0)
      continue

    const form = new FormData()
    for (const hash of bucket) {
      // CF expects the part to be the file's base64 content keyed by its hash; ?base64=true tells CF to decode it.
      // The Blob's Content-Type is what CF will serve the file as later — so set it from the file's extension.
      const b64 = b64ByHash[hash]!
      const mime = mimeByHash[hash] ?? 'application/octet-stream'
      form.append(hash, new Blob([b64], { type: mime }), hash)
    }

    const res = await fetch(`${BASE}/accounts/${accountId}/workers/assets/upload?base64=true`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${completionJwt}` },
      body: form,
    })
    if (!res.ok)
      throw createError({ statusCode: 502, statusMessage: `Asset bucket upload failed (${res.status}): ${await res.text()}` })

    const data = await res.json() as { result?: { jwt?: string }, success: boolean }
    // Only the last bucket's response carries the final completion token.
    if (data.result?.jwt)
      completionJwt = data.result.jwt
  }

  return completionJwt
}

export async function uploadWorker(
  token: string,
  accountId: string,
  scriptName: string,
  bundle: UploadWorkerBundle,
  resources: ProvisionedResources,
  version: string,
  assetsJwt: string | null,
): Promise<void> {
  const form = new FormData()
  const bindings: Array<Record<string, unknown>> = [
    { type: 'd1', name: 'DB', id: resources.dbId },
    { type: 'kv_namespace', name: 'KV', namespace_id: resources.kvId },
    { type: 'r2_bucket', name: 'BLOB', bucket_name: resources.bucketName },
    { type: 'plain_text', name: 'DEPLOYED_VERSION', text: version },
  ]
  if (assetsJwt)
    bindings.push({ type: 'assets', name: 'ASSETS' })

  const metadata: Record<string, unknown> = {
    main_module: bundle.main,
    compatibility_date: bundle.compatibilityDate,
    compatibility_flags: ['nodejs_compat'],
    bindings,
  }
  if (assetsJwt) {
    metadata.assets = {
      jwt: assetsJwt,
      config: { html_handling: 'auto-trailing-slash', not_found_handling: 'single-page-application' },
    }
  }

  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))

  function b64decode(s: string): ArrayBuffer {
    const bytes = Uint8Array.from(atob(s), c => c.charCodeAt(0))
    // Return a fresh ArrayBuffer slice so the Blob constructor accepts it (Uint8Array<ArrayBufferLike> isn't assignable to BlobPart in strict TS).
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  }

  form.append(bundle.main, new Blob([b64decode(bundle.modules[bundle.main]!)], { type: 'application/javascript+module' }), bundle.main)
  for (const [name, b64] of Object.entries(bundle.modules)) {
    if (name !== bundle.main)
      form.append(name, new Blob([b64decode(b64)], { type: 'application/javascript+module' }), name)
  }

  const res = await fetch(`${BASE}/accounts/${accountId}/workers/scripts/${scriptName}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok)
    throw createError({ statusCode: 502, statusMessage: `Worker upload failed: ${await res.text()}` })
}

export type CfSecretType = 'secret_text' | 'plain_text'

export async function setWorkerSecret(
  token: string,
  accountId: string,
  scriptName: string,
  name: string,
  value: string,
  type: CfSecretType = 'secret_text',
): Promise<void> {
  const res = await cf<unknown>(token, 'PUT', `/accounts/${accountId}/workers/scripts/${scriptName}/secrets`, { name, text: value, type })
  if (!res?.success) {
    const msg = res?.errors?.[0]?.message ?? 'Unknown error'
    throw createError({ statusCode: 502, statusMessage: `Failed to set worker secret ${name}: ${msg}` })
  }
}

export async function listWorkerSecrets(
  token: string,
  accountId: string,
  scriptName: string,
): Promise<{ name: string, type: string }[]> {
  const res = await cf<{ name: string, type: string }[]>(
    token,
    'GET',
    `/accounts/${accountId}/workers/scripts/${scriptName}/secrets`,
  )
  return res?.result ?? []
}

export async function deleteWorkerSecret(
  token: string,
  accountId: string,
  scriptName: string,
  name: string,
): Promise<void> {
  // 404 is fine (already gone); other 4xx/5xx should surface.
  const res = await cfRaw(token, 'DELETE', `/accounts/${accountId}/workers/scripts/${scriptName}/secrets/${name}`)
  if (!res.ok && res.status !== 404)
    throw createError({ statusCode: 502, statusMessage: `Failed to delete worker secret ${name}: ${await res.text()}` })
}

export async function enableSubdomain(token: string, accountId: string, scriptName: string): Promise<string> {
  const sub = await cf<{ subdomain: string }>(token, 'GET', `/accounts/${accountId}/workers/subdomain`)
  const subdomain = sub?.result?.subdomain
  if (!subdomain)
    throw createError({ statusCode: 400, statusMessage: 'No workers.dev subdomain configured for this account' })
  await cf(token, 'POST', `/accounts/${accountId}/workers/scripts/${scriptName}/subdomain`, { enabled: true })
  return `https://${scriptName}.${subdomain}.workers.dev`
}
