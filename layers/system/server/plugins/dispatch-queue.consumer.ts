import type { QueueEnvelope } from '~~/cloudflare/queue'
import type { DispatchEmailPayload } from '#layers/system/server/services/dispatch'
import { DISPATCH_MESSAGE_TYPE, DISPATCH_QUEUE_NAME, sendDispatchMessage } from '#layers/system/server/services/dispatch'

/**
 * Cloudflare Queues consumer for bulk email dispatch. Fires only on Cloudflare
 * (the `cloudflare:queue` hook), once per delivered batch. Per-message ack/retry
 * gives single-recipient retry granularity; failures fall through to the DLQ
 * after `max_retries` (see cloudflare/README.md). A no-op everywhere the queue
 * isn't configured — the hook simply never fires.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('cloudflare:queue', async ({ batch }) => {
    if (batch.queue !== DISPATCH_QUEUE_NAME)
      return
    for (const message of batch.messages) {
      const body = message.body as QueueEnvelope<DispatchEmailPayload>
      if (body?.type !== DISPATCH_MESSAGE_TYPE) {
        message.ack()
        continue
      }
      try {
        await sendDispatchMessage(body.payload)
        message.ack()
      }
      catch (err) {
        console.error(JSON.stringify({
          message: 'dispatch queue send failed',
          dispatchId: body.payload?.dispatchId,
          error: err instanceof Error ? err.message : String(err),
        }))
        message.retry()
      }
    }
  })
})
