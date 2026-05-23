import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { getBalance } from '#layers/billing/server/services/credit'

export default defineAuthorizedHandler(['billing:read'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  return { balance: await getBalance(orgId) }
})
