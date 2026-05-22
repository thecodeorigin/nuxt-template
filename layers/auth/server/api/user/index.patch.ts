import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { createError, getCookie, getHeader, readValidatedBody } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { persistSession } from '#layers/auth/server/services/session'
import { UpdateUserSchema } from '#layers/auth/shared/schemas/user'

export default defineAuthenticatedHandler(async (event, session) => {
  const body = await readValidatedBody(event, UpdateUserSchema.parse)

  if (body.username) {
    const [clash] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(and(eq(userTable.username, body.username), ne(userTable.id, session.id)))
      .limit(1)
    if (clash)
      throw createError({ statusCode: 400, statusMessage: 'Username already taken' })
  }

  const fields: Partial<{ name: string, username: string, bio: string }> = {}
  if (body.name !== undefined)
    fields.name = body.name
  if (body.username !== undefined)
    fields.username = body.username
  if (body.bio !== undefined)
    fields.bio = body.bio

  const [updated] = await db.update(userTable).set(fields).where(eq(userTable.id, session.id)).returning()
  if (!updated)
    throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const sid = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
  if (sid) {
    await persistSession(event, updated, {
      provider: session.provider,
      activeOrganizationId: session.activeOrganizationId,
      impersonator: session.impersonator,
      sessionId: sid,
    })
  }
  return { success: true }
})
