import { getRouterParam, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { addAgentMessage } from '#layers/support/server/services/ticket'
import { PostMessageSchema } from '#layers/support/shared/schemas/ticket'

export default defineAuthorizedHandler(['support:manage'], async (event, { session }) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const { body } = await readValidatedBody(event, PostMessageSchema.parse)
  return addAgentMessage(session.id, id, body)
})
