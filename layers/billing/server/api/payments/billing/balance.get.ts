import { createError } from 'h3'
import { getBalance } from '#layers/billing/server/services/credit'

export default defineAuthorizedHandler(['billing:read'], async (_event, { session }) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  return { balance: await getBalance(orgId) }
})
