import { userTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { persistSession } from '#layers/auth/server/services/session'

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+\d{7,15}$/, 'Invalid phone number'),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const body = await readValidatedBody(event, phoneSchema.parse)

  const rateLimitKey = `ratelimit:phone-update:${session.id}`
  const attempts = await kv.get<number>(rateLimitKey) || 0

  if (attempts >= 5) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again in 10 minutes.',
    })
  }

  await kv.set(rateLimitKey, attempts + 1, { ttl: 600 })

  try {
    const now = new Date()

    const [existedUserByPhoneNumber] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.primary_phone, body.phone))
      .limit(1)

    if (existedUserByPhoneNumber && existedUserByPhoneNumber.id !== session.id) {
      throw createError({ statusCode: 400, statusMessage: 'Phone number already in use' })
    }

    const [updatedUser] = await db.update(userTable)
      .set({
        primary_phone: body.phone,
        verified: true,
        updated_at: now,
      })
      .where(eq(userTable.id, session.id))
      .returning()

    if (!updatedUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
    if (sessionId) {
      await persistSession(event, updatedUser, {
        provider: session.provider,
        activeOrganizationId: session.activeOrganizationId,
        impersonator: session.impersonator,
        sessionId,
      })
    }

    return { success: true }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({ statusCode: 500, statusMessage: 'Failed to update phone number' })
  }
})
