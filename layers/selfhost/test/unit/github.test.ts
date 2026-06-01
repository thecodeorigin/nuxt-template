import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('createError', ({ statusCode, statusMessage }: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(statusMessage), { statusCode }))

const bundleFixture = {
  main: 'index.mjs',
  compatibilityDate: '2025-01-01',
  modules: { 'index.mjs': 'aGVsbG8=' },
  migrations: [],
  version: 'v1.0.0',
}

async function sha256OfBytes(bytes: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', Uint8Array.from(bytes))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

describe('getLatestBundle', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('downloads via browser_download_url when no token is configured (public repo)', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ githubToken: '' }))
    const bytes = new TextEncoder().encode(JSON.stringify(bundleFixture))
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          tag_name: 'v1.0.0',
          body: 'release notes',
          assets: [{ name: 'bundle.json', browser_download_url: 'https://github.example/bundle.json', url: 'https://api.github.com/asset/1' }],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      } as Response)

    const { getLatestBundle } = await import('#layers/selfhost/server/services/github')
    const { version, bundle } = await getLatestBundle('owner/repo')
    expect(version).toBe('v1.0.0')
    expect(bundle.main).toBe('index.mjs')

    const second = vi.mocked(fetch).mock.calls[1]!
    expect(String(second[0])).toBe('https://github.example/bundle.json')
  })

  it('downloads via the API asset URL with Authorization when a token is configured (private repo)', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ githubToken: 'ghp_secret' }))
    const bytes = new TextEncoder().encode(JSON.stringify(bundleFixture))
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          tag_name: 'v1.0.0',
          body: '',
          assets: [{ name: 'bundle.json', browser_download_url: 'https://github.example/bundle.json', url: 'https://api.github.com/asset/1' }],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      } as Response)

    const { getLatestBundle } = await import('#layers/selfhost/server/services/github')
    await getLatestBundle('owner/private')

    const calls = vi.mocked(fetch).mock.calls
    expect(String(calls[1]![0])).toBe('https://api.github.com/asset/1')
    const headers = (calls[1]![1] as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer ghp_secret')
    expect(headers.Accept).toBe('application/octet-stream')
  })

  it('throws on SHA-256 mismatch when the release body advertises one', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ githubToken: '' }))
    const bytes = new TextEncoder().encode(JSON.stringify(bundleFixture))
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          tag_name: 'v1.0.0',
          body: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
          assets: [{ name: 'bundle.json', browser_download_url: 'https://github.example/bundle.json', url: 'x' }],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      } as Response)

    const { getLatestBundle } = await import('#layers/selfhost/server/services/github')
    await expect(getLatestBundle('owner/repo')).rejects.toMatchObject({ statusCode: 400 })
  })

  it('passes SHA-256 verification when the body contains the matching hash', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ githubToken: '' }))
    const bytes = new TextEncoder().encode(JSON.stringify(bundleFixture))
    const hash = await sha256OfBytes(bytes)
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          tag_name: 'v1.0.0',
          body: `release notes\nsha256:${hash}`,
          assets: [{ name: 'bundle.json', browser_download_url: 'https://github.example/bundle.json', url: 'x' }],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      } as Response)

    const { getLatestBundle } = await import('#layers/selfhost/server/services/github')
    const result = await getLatestBundle('owner/repo')
    expect(result.sha256).toBe(hash)
  })

  it('throws 404 when there is no bundle.json asset', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ githubToken: '' }))
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ tag_name: 'v1.0.0', body: '', assets: [] }),
    } as Response)

    const { getLatestBundle } = await import('#layers/selfhost/server/services/github')
    await expect(getLatestBundle('owner/repo')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('getLatestVersion', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns the tag_name', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ githubToken: '' }))
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ tag_name: 'v2.5.0' }),
    } as Response)
    const { getLatestVersion } = await import('#layers/selfhost/server/services/github')
    expect(await getLatestVersion('owner/repo')).toBe('v2.5.0')
  })

  it('returns null when the API fails', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ githubToken: '' }))
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 502, statusText: 'Bad Gateway' } as Response)
    const { getLatestVersion } = await import('#layers/selfhost/server/services/github')
    expect(await getLatestVersion('owner/repo')).toBeNull()
  })
})
