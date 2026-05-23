import { readValidatedBody } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { createTenantOrganization } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { CreateOrganizationSchema } from '#layers/auth/shared/schemas/organization'

export default defineAuthenticatedHandler(async (event, session) => {
  const { name } = await readValidatedBody(event, CreateOrganizationSchema.parse)
  const org = await createTenantOrganization(session.id, name)
  await refreshUserSessions(session.id)
  return org
})
