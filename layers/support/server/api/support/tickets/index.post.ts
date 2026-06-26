import { readValidatedBody } from 'h3'
import { createTicket } from '#layers/support/server/services/ticket'
import { CreateTicketSchema } from '#layers/support/shared/schemas/ticket'

export default defineAuthenticatedHandler(async (event, session) => {
  const orgId = event.context.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const input = await readValidatedBody(event, CreateTicketSchema.parse)
  return createTicket({
    userId: session.sub,
    organizationId: orgId,
    kind: input.kind,
    category: input.category,
    subject: input.subject,
    body: input.body,
  })
})
