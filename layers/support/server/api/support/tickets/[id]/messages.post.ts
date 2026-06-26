import { getRouterParam, readValidatedBody } from 'h3'
import { addUserMessage } from '#layers/support/server/services/ticket'
import { PostMessageSchema } from '#layers/support/shared/schemas/ticket'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const { body } = await readValidatedBody(event, PostMessageSchema.parse)
  return addUserMessage(session.sub, id, body)
})
