import { createError } from 'h3'

export interface Bundle {
  main: string
  compatibilityDate: string
  modules: Record<string, string>
  // Static frontend files from .output/public/, keyed by absolute path ("/_nuxt/foo.js"). Base64 encoded.
  // Optional for backwards compatibility with older bundles that didn't include assets.
  assets?: Record<string, string>
  migrations: { name: string, sql: string }[]
  version: string
}

interface GitHubAsset { name: string, browser_download_url: string, url: string }
interface GitHubRelease { tag_name: string, body?: string, assets?: GitHubAsset[] }

async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', Uint8Array.from(data))
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'nuxt-template-selfhost',
  }
  const token = useRuntimeConfig().githubToken
  if (token)
    headers.Authorization = `Bearer ${token}`
  return headers
}

async function fetchRelease(repo: string): Promise<GitHubRelease> {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: authHeaders() })
  if (!res.ok)
    throw createError({ statusCode: res.status, statusMessage: `GitHub releases API ${res.status} ${res.statusText}` })
  return res.json() as Promise<GitHubRelease>
}

export async function getLatestBundle(repo: string): Promise<{ version: string, bundle: Bundle, sha256: string }> {
  const rel = await fetchRelease(repo)
  const asset = rel.assets?.find(a => a.name === 'bundle.json')
  if (!asset)
    throw createError({ statusCode: 404, statusMessage: 'No bundle.json found in latest release' })

  // For private repos, the browser_download_url requires the same Authorization header; use the API URL with octet-stream Accept.
  const token = useRuntimeConfig().githubToken
  const downloadRes = token
    ? await fetch(asset.url, { headers: { ...authHeaders(), Accept: 'application/octet-stream' } })
    : await fetch(asset.browser_download_url)

  if (!downloadRes.ok)
    throw createError({ statusCode: 502, statusMessage: `Failed to download bundle: ${downloadRes.status}` })

  const raw = new Uint8Array(await downloadRes.arrayBuffer())
  const sha256 = await sha256Hex(raw)

  // Verify SHA-256 if release body advertises one (`sha256:<hex>`). Mismatch is a tampering signal.
  if (rel.body?.includes('sha256:') && !rel.body.includes(sha256))
    throw createError({ statusCode: 400, statusMessage: 'Bundle SHA-256 mismatch — possible tampering' })

  const bundle = JSON.parse(new TextDecoder().decode(raw)) as Bundle
  return { version: rel.tag_name, bundle, sha256 }
}

export async function getLatestVersion(repo: string): Promise<string | null> {
  try {
    const rel = await fetchRelease(repo)
    return rel.tag_name ?? null
  }
  catch {
    return null
  }
}
