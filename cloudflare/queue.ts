import type { H3Event } from 'h3'

/**
 * Cloudflare-specific producer-side glue for Cloudflare Queues. Kept out of the
 * layers because it is platform infrastructure, not domain logic: any layer can
 * enqueue work through it. The consumer side is a Nitro plugin listening on the
 * `cloudflare:queue` hook (see layers/<feature>/server/plugins/*.consumer.ts).
 *
 * Setup (paid Workers plan required) lives in cloudflare/README.md.
 */

/** Minimal shape of a Cloudflare Queue producer binding (`env.<BINDING>`). */
export interface QueueProducer {
  send: (body: unknown, options?: { contentType?: string, delaySeconds?: number }) => Promise<void>
  sendBatch: (messages: Iterable<{ body: unknown }>) => Promise<void>
}

/** Envelope so one queue can carry several message kinds, routed by `type`. */
export interface QueueEnvelope<T = unknown> {
  type: string
  payload: T
}

/** Cloudflare caps a single sendBatch at 100 messages (and 256 KB total). */
export const QUEUE_BATCH_LIMIT = 100

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1)
    throw new Error('chunk size must be >= 1')
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size))
  return out
}

/**
 * Resolve a Cloudflare Queue producer binding from the request context. Returns
 * `null` off-Cloudflare (`pnpm dev`, Node/Vitest), where the binding is absent —
 * callers detect this and fall back to running the work inline.
 */
export function getQueueProducer(event: H3Event, binding: string): QueueProducer | null {
  const env = (event.context as { cloudflare?: { env?: Record<string, unknown> } }).cloudflare?.env
  const queue = env?.[binding] as QueueProducer | undefined
  return queue ?? null
}

/** Enqueue payloads as typed envelopes, respecting the per-batch cap. Returns the count sent. */
export async function enqueue<T>(
  queue: QueueProducer,
  type: string,
  payloads: readonly T[],
  chunkSize: number = QUEUE_BATCH_LIMIT,
): Promise<number> {
  for (const group of chunk(payloads, chunkSize))
    await queue.sendBatch(group.map(payload => ({ body: { type, payload } satisfies QueueEnvelope<T> })))
  return payloads.length
}
