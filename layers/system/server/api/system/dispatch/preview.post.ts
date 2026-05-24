import { readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { resolveDispatchRecipients } from '#layers/system/server/services/dispatch'
import { DispatchFilterSchema } from '#layers/system/shared/schemas/dispatch'

export default defineAuthorizedHandler(['system:manage'], async (event) => {
  const filter = await readValidatedBody(event, DispatchFilterSchema.parse)
  const { enabled, skippedCount, total } = await resolveDispatchRecipients(filter)
  return { total, enabled: enabled.length, skipped: skippedCount }
})
