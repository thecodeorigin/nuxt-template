import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { getUserOrganizations } from '#layers/auth/server/services/organization'

export default defineAuthenticatedHandler((_event, session) => getUserOrganizations(session.id))
