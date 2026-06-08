import type { H3Event } from 'h3'
import type { QueueEnvelope, QueueProducer } from '~~/cloudflare/queue'
import { describe, expect, it } from 'vitest'
import { chunk, enqueue, getQueueProducer } from '~~/cloudflare/queue'

describe('chunk', () => {
  it('splits into groups of the given size with a remainder', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })
  it('returns an empty array for no items', () => {
    expect(chunk([], 3)).toEqual([])
  })
  it('keeps a single group when size exceeds length', () => {
    expect(chunk([1, 2], 10)).toEqual([[1, 2]])
  })
  it('throws on a non-positive size', () => {
    expect(() => chunk([1], 0)).toThrow()
  })
})

describe('getQueueProducer', () => {
  it('returns null when the cloudflare context is absent (dev / node)', () => {
    const event = { context: {} } as unknown as H3Event
    expect(getQueueProducer(event, 'DISPATCH_QUEUE')).toBeNull()
  })
  it('returns null when the named binding is missing', () => {
    const event = { context: { cloudflare: { env: {} } } } as unknown as H3Event
    expect(getQueueProducer(event, 'DISPATCH_QUEUE')).toBeNull()
  })
  it('returns the binding when present', () => {
    const queue = { send: async () => {}, sendBatch: async () => {} }
    const event = { context: { cloudflare: { env: { DISPATCH_QUEUE: queue } } } } as unknown as H3Event
    expect(getQueueProducer(event, 'DISPATCH_QUEUE')).toBe(queue)
  })
})

describe('enqueue', () => {
  function fakeQueue() {
    const batches: { body: unknown }[][] = []
    const queue: QueueProducer = {
      send: async () => {},
      sendBatch: async (messages) => { batches.push([...messages]) },
    }
    return { queue, batches }
  }

  it('wraps each payload in a typed envelope', async () => {
    const { queue, batches } = fakeQueue()
    const sent = await enqueue(queue, 'dispatch:email', [{ to: 'a' }, { to: 'b' }])
    expect(sent).toBe(2)
    const bodies = batches.flat().map(m => m.body as QueueEnvelope)
    expect(bodies).toEqual([
      { type: 'dispatch:email', payload: { to: 'a' } },
      { type: 'dispatch:email', payload: { to: 'b' } },
    ])
  })

  it('splits into multiple sendBatch calls at the chunk cap', async () => {
    const { queue, batches } = fakeQueue()
    await enqueue(queue, 't', [1, 2, 3, 4, 5], 2)
    expect(batches.map(b => b.length)).toEqual([2, 2, 1])
  })

  it('sends nothing for an empty payload list', async () => {
    const { queue, batches } = fakeQueue()
    expect(await enqueue(queue, 't', [])).toBe(0)
    expect(batches).toEqual([])
  })
})
