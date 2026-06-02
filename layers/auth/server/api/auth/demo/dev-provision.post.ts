import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { createPersonalOrganization } from '#layers/auth/server/services/organization'
import { persistSession } from '#layers/auth/server/services/session'
import { DevProvisionSchema } from '#layers/auth/shared/schemas/dev'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { email, name } = await readValidatedBody(event, DevProvisionSchema.parse)

  const username = email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  const [user] = await db.insert(userTable).values({
    primary_email: email,
    username,
    name: name ?? username,
    verified: true,
  }).returning()
  const org = await createPersonalOrganization(user!)
  const { sessionId } = await persistSession(event, user!, { provider: 'dev-provision' })

  return { session_id: sessionId, user_id: user!.id, personal_org_id: org.id }
})
