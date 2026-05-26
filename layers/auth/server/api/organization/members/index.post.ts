import { db } from '@nuxthub/db'
import { organizationMemberTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { isMember } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { DEFAULT_MEMBER_ABILITIES } from '#layers/auth/shared/permissions'
import { AddMemberSchema } from '#layers/auth/shared/schemas/member'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  const { email } = await readValidatedBody(event, AddMemberSchema.parse)

  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.primary_email, email))
    .limit(1)
  if (!user)
    throw createError({ statusCode: 404, statusMessage: 'No user found with that email' })

  if (await isMember(user.id, orgId))
    throw createError({ statusCode: 409, statusMessage: 'User is already a member of this organization' })

  await db
    .insert(organizationMemberTable)
    .values({ user_id: user.id, organization_id: orgId, abilities: [...DEFAULT_MEMBER_ABILITIES] })

  await refreshUserSessions(user.id)

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    primary_email: user.primary_email,
    avatar: user.avatar,
    abilities: [...DEFAULT_MEMBER_ABILITIES],
    is_suspended: user.is_suspended,
  }
})
