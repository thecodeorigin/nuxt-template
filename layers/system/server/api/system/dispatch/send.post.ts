import { kv } from '@nuxthub/kv'
import { readValidatedBody } from 'h3'
import { sendUserEmail } from '~~/layers/auth/server/services/email'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { composeEmailHtml, resolveDispatchRecipients } from '#layers/system/server/services/dispatch'
import { DispatchSendSchema } from '#layers/system/shared/schemas/dispatch'

const MAX_RECIPIENTS = 500
const RATE_LIMIT = 10
const RATE_WINDOW = 60 * 60 // seconds
const BATCH = 20

export default defineAuthorizedHandler(['system:manage'], async (event, { session }) => {
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
  let sent = 0
  let failed = 0
  for (let i = 0; i < enabled.length; i += BATCH) {
    const chunk = enabled.slice(i, i + BATCH)
    const results = await Promise.allSettled(chunk.map(u => sendUserEmail(u, { subject, html })))
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.sent)
        sent++
      else
        failed++
    }
  }

  return { sent, failed, skipped: skippedCount, total }
})
