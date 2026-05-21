import { createError, defineEventHandler, getRouterParam } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The route handlers read the request body via the auto-imported h3
// `readValidatedBody`. Override just that export so tests can inject an
// arbitrary body object (stored on `event.__body`) without a real HTTP
// request; everything else in h3 stays real.
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()
  return {
    ...actual,
    readValidatedBody: async (event: { __body?: unknown }, schema: (v: unknown) => unknown) => schema(event.__body),
  }
})

// Mirror the same helpers onto globalThis so the bare auto-import references
// inside the handlers also resolve in the node unit environment.
Object.assign(globalThis, {
  defineEventHandler,
  getRouterParam,
  createError,
  readValidatedBody: async (event: { __body?: unknown }, schema: (v: unknown) => unknown) => schema(event.__body),
})

// Stateful in-memory KV fake that honours the optional prefix filter on keys().
const store = new Map<string, unknown>()
vi.mock('@nuxthub/kv', () => ({
  kv: {
    get: async <T>(key: string) => (store.get(key) as T | undefined) ?? null,
    set: async (key: string, value: unknown) => { store.set(key, value) },
    del: async (key: string) => { store.delete(key) },
    has: async (key: string) => store.has(key),
    keys: async (prefix = '') => [...store.keys()].filter(k => k.startsWith(prefix)),
    clear: async (prefix = '') => {
      for (const k of [...store.keys()]) {
        if (k.startsWith(prefix))
          store.delete(k)
      }
    },
  },
}))

const { default: listHandler } = await import('#layers/todo/server/api/todos/index.get')
const { default: createHandler } = await import('#layers/todo/server/api/todos/index.post')
const { default: patchHandler } = await import('#layers/todo/server/api/todos/[id].patch')
const { default: deleteHandler } = await import('#layers/todo/server/api/todos/[id].delete')

function makeGetEvent() {
  return { node: { req: {}, res: {} } } as unknown as Parameters<typeof listHandler>[0]
}

function makePostEvent(body: unknown) {
  return { node: { req: {}, res: {} }, __body: body } as unknown as Parameters<typeof createHandler>[0]
}

function makePatchEvent(id: string, body: unknown) {
  return {
    node: { req: {}, res: {} },
    context: { params: { id } },
    __body: body,
  } as unknown as Parameters<typeof patchHandler>[0]
}

function makeDeleteEvent(id: string) {
  return {
    node: { req: {}, res: {} },
    context: { params: { id } },
  } as unknown as Parameters<typeof deleteHandler>[0]
}

beforeEach(() => {
  store.clear()
})

describe('todo KV namespace isolation', () => {
  it('excludes non-todo keys present in the shared KV store from the list', async () => {
    // Seed a session key and a ratelimit key directly into the store —
    // simulating what the auth layer writes to the same KV namespace.
    store.set('session:abc123', { id: 'user-1', primary_email: 'user@example.com', abilities: [] })
    store.set('ratelimit:127.0.0.1', 42)

    store.set('todo:my-id', {
      id: 'my-id',
      title: 'buy milk',
      completed: false,
      createdAt: new Date().toISOString(),
    })

    const result = await listHandler(makeGetEvent())

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('buy milk')
  })

  it('returns an empty array when only non-todo keys exist', async () => {
    store.set('session:abc123', { id: 'user-1' })

    const result = await listHandler(makeGetEvent())

    expect(result).toEqual([])
  })

  it('returns todos sorted newest-first', async () => {
    store.set('todo:old', {
      id: 'old',
      title: 'older task',
      completed: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    store.set('todo:new', {
      id: 'new',
      title: 'newer task',
      completed: false,
      createdAt: '2026-06-01T00:00:00.000Z',
    })

    const result = await listHandler(makeGetEvent())

    expect(result[0].id).toBe('new')
    expect(result[1].id).toBe('old')
  })
})

describe('todo KV key scheme consistency', () => {
  it('stores a created todo under the todo: prefix', async () => {
    const result = await createHandler(makePostEvent({ title: 'write tests' }))

    expect(result.title).toBe('write tests')
    expect(result.completed).toBe(false)
    expect(store.has(`todo:${result.id}`)).toBe(true)
    expect(store.has(result.id)).toBe(false)
  })

  it('patches a todo found under the todo: prefix', async () => {
    store.set('todo:t1', {
      id: 't1',
      title: 'original',
      completed: false,
      createdAt: new Date().toISOString(),
    })

    const result = await patchHandler(makePatchEvent('t1', { completed: true }))

    expect(result.completed).toBe(true)
    expect(result.title).toBe('original')
    expect(store.has('todo:t1')).toBe(true)
    expect(store.has('t1')).toBe(false)
  })

  it('returns 404 from patch for a key absent under the todo: prefix', async () => {
    // Bare key (old scheme, no prefix) — must NOT be found.
    store.set('t1', { id: 't1', title: 'ghost', completed: false, createdAt: new Date().toISOString() })

    await expect(patchHandler(makePatchEvent('t1', { completed: true }))).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('deletes the correct todo: prefixed key', async () => {
    store.set('todo:t2', { id: 't2', title: 'to delete', completed: false, createdAt: new Date().toISOString() })

    const result = await deleteHandler(makeDeleteEvent('t2'))

    expect(result).toEqual({ success: true })
    expect(store.has('todo:t2')).toBe(false)
  })

  it('returns 404 from delete for a bare (un-prefixed) key', async () => {
    store.set('t2', { id: 't2', title: 'bare', completed: false, createdAt: new Date().toISOString() })

    await expect(deleteHandler(makeDeleteEvent('t2'))).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})
