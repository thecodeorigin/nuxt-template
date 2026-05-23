import { createError, getRouterParam } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import {
  deleteInvitation,
  ensureMembership,
  getInvitationByToken,
  getOrganizationById,
  isMember,
} from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { DEFAULT_MEMBER_ABILITIES, DEFAULT_PERSONAL_ORG_ABILITIES } from '#layers/auth/shared/permissions'

const ROLE_ABILITIES: Record<string, readonly string[]> = {
  member: DEFAULT_MEMBER_ABILITIES,
  admin: DEFAULT_PERSONAL_ORG_ABILITIES,
}

export default defineAuthenticatedHandler(async (event, session) => {
  const token = getRouterParam(event, 'token')
  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  const inv = await getInvitationByToken(token)
  if (!inv || inv.expires_at < new Date())
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found or expired' })

  const org = await getOrganizationById(inv.organization_id)
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })

  if (await isMember(session.id, inv.organization_id))
    throw createError({ statusCode: 409, statusMessage: 'You are already a member of this organization' })

  const abilities = ROLE_ABILITIES[inv.role] ?? DEFAULT_MEMBER_ABILITIES
  await ensureMembership(session.id, inv.organization_id, abilities)
  await deleteInvitation(inv.id)
  await refreshUserSessions(session.id)

  return { org: { id: org.id, name: org.name } }
})
