import { persistSession } from '#layers/auth/server/services/session'
import { createUser } from '#layers/auth/server/services/user'
import { DevProvisionSchema } from '#layers/auth/shared/schemas/dev'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { email, name } = await readValidatedBody(event, DevProvisionSchema.parse)
  const { user, personal_org_id } = await createUser({ email, name })
  const { sessionId } = await persistSession(event, user, { provider: 'dev-provision' })

  return { session_id: sessionId, user_id: user.id, personal_org_id }
})
