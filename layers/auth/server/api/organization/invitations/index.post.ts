import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { createInvitation, getOrgInvitations, isMember } from '#layers/auth/server/services/organization'
import { CreateInvitationSchema } from '#layers/auth/shared/schemas/invitation'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  const { email, role_id, project_ids } = await readValidatedBody(event, CreateInvitationSchema.parse)

  const [existing] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.primary_email, email))
    .limit(1)
  if (existing && await isMember(existing.id, orgId))
    throw createError({ statusCode: 409, statusMessage: 'User is already a member of this organization' })

  const pending = await getOrgInvitations(orgId)
  if (pending.some(i => i.email === email))
    throw createError({ statusCode: 409, statusMessage: 'An invitation for this email is already pending' })

  return createInvitation(orgId, email, role_id ?? null, session.id, project_ids ?? [])
})
