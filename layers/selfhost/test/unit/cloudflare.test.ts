import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('createError', ({ statusCode, statusMessage }: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(statusMessage), { statusCode }))

describe('verifyToken', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('rejects a non-active token', async () => {
    vi.mocked(fetch).mockResolvedValue({ json: async () => ({ result: { status: 'disabled' } }) } as Response)
    const { verifyToken } = await import('#layers/selfhost/server/services/cloudflare')
    await expect(verifyToken('bad')).rejects.toMatchObject({ statusCode: 400 })
  })

  it('returns the token info for an active token', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ result: { status: 'active', expires_on: '2030-01-01T00:00:00Z' } }),
    } as Response)
    const { verifyToken } = await import('#layers/selfhost/server/services/cloudflare')
    const info = await verifyToken('good')
    expect(info.status).toBe('active')
    expect(info.expires_on).toBe('2030-01-01T00:00:00Z')
  })
})

describe('listAccounts / discoverAccount', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('listAccounts returns id+name pairs', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ result: [{ id: 'acc-1', name: 'Personal' }, { id: 'acc-2', name: 'Work' }] }),
    } as Response)
    const { listAccounts } = await import('#layers/selfhost/server/services/cloudflare')
    expect(await listAccounts('t')).toEqual([
      { id: 'acc-1', name: 'Personal' },
      { id: 'acc-2', name: 'Work' },
    ])
  })

  it('discoverAccount returns the first account id', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ result: [{ id: 'acc-1', name: 'Personal' }, { id: 'acc-2', name: 'Work' }] }),
    } as Response)
    const { discoverAccount } = await import('#layers/selfhost/server/services/cloudflare')
    expect(await discoverAccount('t')).toBe('acc-1')
  })

  it('listAccounts throws when the token has no account access', async () => {
    vi.mocked(fetch).mockResolvedValue({ json: async () => ({ result: [] }) } as Response)
    const { listAccounts } = await import('#layers/selfhost/server/services/cloudflare')
    await expect(listAccounts('t')).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('probeCapabilities (write-probe)', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('reports Workers Scripts missing when PUT returns 403', async () => {
    // Sequence: PUT script (403), POST d1 (success), DELETE d1, POST kv (success), DELETE kv,
    // POST r2 (success), DELETE r2, GET workers subdomain (200)
    let call = 0
    vi.mocked(fetch).mockImplementation(async (_url: string | URL | Request, init?: RequestInit) => {
      call++
      const method = init?.method ?? 'GET'
      // 1: PUT workers script → 403
      if (call === 1 && method === 'PUT')
        return { status: 403, ok: false, json: async () => ({}), text: async () => 'forbidden' } as Response
      // POSTs return success envelope
      if (method === 'POST')
        return { status: 200, ok: true, json: async () => ({ success: true, result: { uuid: 'x', id: 'x' } }), text: async () => '' } as Response
      // DELETEs and the final GET subdomain
      return { status: 200, ok: true, json: async () => ({ success: true, result: { subdomain: 'example' } }), text: async () => '' } as Response
    })

    const { probeCapabilities } = await import('#layers/selfhost/server/services/cloudflare')
    const missing = await probeCapabilities('t', 'acc')
    expect(missing).toContain('Workers Scripts')
  })

  it('returns empty array when every write-probe succeeds', async () => {
    vi.mocked(fetch).mockImplementation(async (_url, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      if (method === 'PUT' || method === 'DELETE')
        return { status: 200, ok: true, json: async () => ({}), text: async () => '' } as Response
      if (method === 'POST')
        return { status: 200, ok: true, json: async () => ({ success: true, result: { uuid: 'x', id: 'x' } }), text: async () => '' } as Response
      return { status: 200, ok: true, json: async () => ({ success: true, result: { subdomain: 'example' } }), text: async () => '' } as Response
    })
    const { probeCapabilities } = await import('#layers/selfhost/server/services/cloudflare')
    expect(await probeCapabilities('t', 'acc')).toEqual([])
  })

  it('reports D1 missing when POST is forbidden', async () => {
    vi.mocked(fetch).mockImplementation(async (url, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      const urlStr = String(url)
      if (method === 'PUT')
        return { status: 200, ok: true, json: async () => ({}), text: async () => '' } as Response
      if (method === 'POST' && urlStr.includes('/d1/database'))
        return { status: 200, ok: true, json: async () => ({ success: false, errors: [{ message: 'forbidden' }] }), text: async () => '' } as Response
      if (method === 'POST')
        return { status: 200, ok: true, json: async () => ({ success: true, result: { uuid: 'x', id: 'x' } }), text: async () => '' } as Response
      return { status: 200, ok: true, json: async () => ({ success: true, result: { subdomain: 'example' } }), text: async () => '' } as Response
    })
    const { probeCapabilities } = await import('#layers/selfhost/server/services/cloudflare')
    expect(await probeCapabilities('t', 'acc')).toContain('D1')
  })
})

describe('enableSubdomain', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns the workers.dev URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ success: true, result: { subdomain: 'my-sub' } }),
    } as Response).mockResolvedValueOnce({
      json: async () => ({ success: true, result: {} }),
    } as Response)
    const { enableSubdomain } = await import('#layers/selfhost/server/services/cloudflare')
    expect(await enableSubdomain('t', 'acc', 'my-script')).toBe('https://my-script.my-sub.workers.dev')
  })

  it('throws when no workers.dev subdomain is configured', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ success: true, result: { subdomain: null } }),
    } as Response)
    const { enableSubdomain } = await import('#layers/selfhost/server/services/cloudflare')
    await expect(enableSubdomain('t', 'acc', 'my-script')).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('uploadAssets', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns null when the assets map is empty', async () => {
    const { uploadAssets } = await import('#layers/selfhost/server/services/cloudflare')
    expect(await uploadAssets('t', 'acc', 'script', {})).toBeNull()
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('starts a session, uploads buckets, and returns the final completion JWT', async () => {
    let call = 0
    let bucketHashes: string[] = []
    vi.mocked(fetch).mockImplementation(async (_url, init?: RequestInit) => {
      call++
      // 1: start session — reflect the manifest hashes back so the function can find them in fileByHash
      if (call === 1) {
        const body = JSON.parse((init?.body as string) ?? '{}') as { manifest: Record<string, { hash: string }> }
        bucketHashes = Object.values(body.manifest).map(m => m.hash)
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, result: { jwt: 'session-jwt', buckets: [bucketHashes] } }),
        } as Response
      }
      // 2: bucket upload → completion JWT
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, result: { jwt: 'completion-jwt' } }),
        text: async () => '',
      } as Response
    })

    const { uploadAssets } = await import('#layers/selfhost/server/services/cloudflare')
    const result = await uploadAssets('t', 'acc', 'script', {
      '/a.js': btoa('console.log(1)'),
      '/b.css': btoa('body { color: red }'),
    })
    expect(result).toBe('completion-jwt')
    expect(bucketHashes).toHaveLength(2)
  })

  it('throws when the session call fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: false, errors: [{ message: 'invalid script name' }] }),
    } as Response)
    const { uploadAssets } = await import('#layers/selfhost/server/services/cloudflare')
    await expect(uploadAssets('t', 'acc', 'script', { '/a.js': btoa('x') }))
      .rejects
      .toMatchObject({ statusCode: 502 })
  })

  it('throws when a bucket upload returns non-2xx', async () => {
    let call = 0
    vi.mocked(fetch).mockImplementation(async (_url, init?: RequestInit) => {
      call++
      if (call === 1) {
        const body = JSON.parse((init?.body as string) ?? '{}') as { manifest: Record<string, { hash: string }> }
        const hashes = Object.values(body.manifest).map(m => m.hash)
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, result: { jwt: 'session', buckets: [hashes] } }),
        } as Response
      }
      return { ok: false, status: 413, text: async () => 'too big' } as Response
    })
    const { uploadAssets } = await import('#layers/selfhost/server/services/cloudflare')
    await expect(uploadAssets('t', 'acc', 'script', { '/a.js': btoa('x') }))
      .rejects
      .toMatchObject({ statusCode: 502 })
  })
})

describe('applyMigrations', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('skips migrations that are already applied', async () => {
    const calls: string[] = []
    vi.mocked(fetch).mockImplementation(async (_url, init?: RequestInit) => {
      const body = JSON.parse((init?.body as string) ?? '{}')
      calls.push(body.sql)
      // First call: create tracker table (no result). Second call: check returns one row → already applied.
      if (body.sql?.startsWith('SELECT name FROM d1_migrations'))
        return { json: async () => ({ result: [{ results: [{ name: '0000_init' }] }] }) } as Response
      return { json: async () => ({ success: true, result: [] }) } as Response
    })
    const { applyMigrations } = await import('#layers/selfhost/server/services/cloudflare')
    await applyMigrations('t', 'acc', 'db', [{ name: '0000_init', sql: 'CREATE TABLE foo (id TEXT)' }])
    // expect: create-tracker + check-applied (only two SQL queries; no INSERT, no migration SQL)
    expect(calls).toHaveLength(2)
    expect(calls[0]).toContain('CREATE TABLE IF NOT EXISTS d1_migrations')
    expect(calls[1]).toContain('SELECT name FROM d1_migrations')
  })

  it('applies a new migration and records it', async () => {
    const calls: string[] = []
    vi.mocked(fetch).mockImplementation(async (_url, init?: RequestInit) => {
      const body = JSON.parse((init?.body as string) ?? '{}')
      calls.push(body.sql)
      if (body.sql?.startsWith('SELECT name FROM d1_migrations'))
        return { json: async () => ({ result: [{ results: [] }] }) } as Response
      return { json: async () => ({ success: true, result: [] }) } as Response
    })
    const { applyMigrations } = await import('#layers/selfhost/server/services/cloudflare')
    await applyMigrations('t', 'acc', 'db', [{ name: '0000_init', sql: 'CREATE TABLE foo (id TEXT)' }])
    expect(calls).toHaveLength(4)
    expect(calls[2]).toBe('CREATE TABLE foo (id TEXT)')
    expect(calls[3]).toContain('INSERT INTO d1_migrations')
  })
})
