import { createError, getRouterParam } from 'h3'
import { getInvitationByToken, getOrganizationById } from '#layers/auth/server/services/organization'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  const inv = await getInvitationByToken(token)
  if (!inv || inv.expires_at < new Date())
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found or expired' })

  const org = await getOrganizationById(inv.organization_id)
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })

  return { id: inv.id, email: inv.email, role: inv.role, org: { id: org.id, name: org.name } }
})
