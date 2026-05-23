import { provisionPersonalUser } from '#layers/auth/server/services/seed'
import { persistSession } from '#layers/auth/server/services/session'
import { DevProvisionSchema } from '#layers/auth/shared/schemas/dev'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { email, name } = await readValidatedBody(event, DevProvisionSchema.parse)
  const { user, personalOrgId } = await provisionPersonalUser(email, name)
  const { sessionId } = await persistSession(event, user, { provider: 'dev-provision' })

  return { session_id: sessionId, user_id: user.id, personal_org_id: personalOrgId }
})
