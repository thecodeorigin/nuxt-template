import { db } from '@nuxthub/db'
import { organizationMemberTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getRouterParam, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { countOrgManagers } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { buildAbility } from '#layers/auth/shared/casl'
import { assertGrantable, keysAllowedFor, SELF_ABILITY_KEYS } from '#layers/auth/shared/permissions'
import { UpdateMemberAbilitiesSchema } from '#layers/auth/shared/schemas/member'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const userId = getRouterParam(event, 'userId')
  if (!userId)
    throw createError({ statusCode: 400, statusMessage: 'Missing userId' })
  if (userId === session.id)
    throw createError({ statusCode: 403, statusMessage: 'You cannot edit your own membership' })

  const { abilities } = await readValidatedBody(event, UpdateMemberAbilitiesSchema.parse)

  // Anti-escalation: only grant tenant abilities the actor holds in this org.
  const [actorM] = await db
    .select()
    .from(organizationMemberTable)
    .where(and(eq(organizationMemberTable.user_id, session.id), eq(organizationMemberTable.organization_id, orgId)))
    .limit(1)
  const actorAllowed = (actorM?.abilities ?? []).filter(a => keysAllowedFor(false).has(a))
  const actorAbility = buildAbility(actorAllowed, session.id)
  const ungrantable = assertGrantable(actorAbility, abilities)
  if (ungrantable.length > 0)
    throw createError({ statusCode: 403, statusMessage: `You cannot grant: ${ungrantable.join(', ')}` })

  // Tenant boundary: target must be a member of the active org.
  const [targetM] = await db
    .select()
    .from(organizationMemberTable)
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)))
    .limit(1)
  if (!targetM)
    throw createError({ statusCode: 404, statusMessage: 'Not a member of this organization' })

  // Last-admin guard.
  if (targetM.abilities.includes('user:manage') && !abilities.includes('user:manage') && (await countOrgManagers(orgId)) <= 1)
    throw createError({ statusCode: 409, statusMessage: 'Cannot remove the last organization admin' })

  // Always carry the full SELF_ABILITY_KEYS catalog — these are permanent defaults
  // for members and are not surfaced in the abilities editor. Preserving only what
  // the target currently holds would silently strip them after a demotion.
  const next = [...new Set([...abilities, ...SELF_ABILITY_KEYS])]

  const [updated] = await db
    .update(organizationMemberTable)
    .set({ abilities: next })
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)))
    .returning()

  await refreshUserSessions(userId)
  return updated!
})
