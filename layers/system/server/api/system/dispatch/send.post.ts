import type { DispatchResult } from '#layers/system/shared/schemas/dispatch'
import { kv } from '@nuxthub/kv'
import { readValidatedBody } from 'h3'
import { enqueue, getQueueProducer, QUEUE_BATCH_LIMIT } from '~~/cloudflare/queue'
import { simplifyNanoId } from '~~/shared/utils/id'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import {
  composeEmailHtml,
  DISPATCH_JOB_TTL,
  DISPATCH_MESSAGE_TYPE,
  DISPATCH_QUEUE_BINDING,
  dispatchJobKey,
  resolveDispatchRecipients,
  sendDispatchInline,
  toDispatchPayloads,
} from '#layers/system/server/services/dispatch'
import { DispatchSendSchema } from '#layers/system/shared/schemas/dispatch'

const MAX_RECIPIENTS = 500
const RATE_LIMIT = 10
const RATE_WINDOW = 60 * 60 // seconds

export default defineAuthorizedHandler(['system:manage'], async (event, { session }): Promise<DispatchResult> => {
  const { filter, subject, body } = await readValidatedBody(event, DispatchSendSchema.parse)

  const rlKey = `ratelimit:dispatch-send:${session.id}`
  const attempts = (await kv.get<number>(rlKey)) || 0
  if (attempts >= RATE_LIMIT)
    throw createError({ statusCode: 429, statusMessage: 'Dispatch limit reached. Try again later.' })

  const { enabled, skippedCount, total } = await resolveDispatchRecipients(filter)
  if (total === 0)
    throw createError({ statusCode: 400, statusMessage: 'No recipients match this filter.' })
  if (enabled.length > MAX_RECIPIENTS)
    throw createError({ statusCode: 413, statusMessage: `Too many recipients (${enabled.length}). Narrow the filter to ${MAX_RECIPIENTS} or fewer.` })

  await kv.set(rlKey, attempts + 1, { ttl: RATE_WINDOW })

  const html = composeEmailHtml(subject, body)

  // On Cloudflare with the queue bound, fan out for background delivery (fast
  // ack, retries, DLQ). Otherwise (dev / tests / queue not configured) send inline.
  const queue = getQueueProducer(event, DISPATCH_QUEUE_BINDING)
  if (!queue) {
    const { sent, failed } = await sendDispatchInline(enabled, subject, html)
    return { mode: 'sent', sent, failed, skipped: skippedCount, total }
  }

  const dispatchId = simplifyNanoId()
  await kv.set(dispatchJobKey(dispatchId), { subject, html }, { ttl: DISPATCH_JOB_TTL })
  const queued = await enqueue(queue, DISPATCH_MESSAGE_TYPE, toDispatchPayloads(dispatchId, enabled), QUEUE_BATCH_LIMIT)
  return { mode: 'queued', queued, skipped: skippedCount, total, dispatchId }
})
