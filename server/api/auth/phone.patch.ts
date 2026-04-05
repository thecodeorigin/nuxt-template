import { eq } from 'drizzle-orm'
import z from 'zod'
import { userTable } from '~~/server/db/pg/schema'
import { defineAuthenticatedHandler } from '~~/server/utils/auth'
import { getPgClient } from '~~/server/utils/pg'

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+\d{7,15}$/, 'Invalid phone number'),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const body = await readValidatedBody(event, phoneSchema.parse)

  const rateLimitKey = `ratelimit:phone-update:${session.id}`
  const storage = useStorage('redis')
  const attempts = await storage.getItem<number>(rateLimitKey) || 0

  if (attempts >= 5) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again in 10 minutes.',
    })
  }

  await storage.setItem(rateLimitKey, attempts + 1, { ttl: 600 })

  try {
    const db = getPgClient()
    const now = new Date()
    // const runtimeConfig = useRuntimeConfig()

    const existedUserByPhoneNumber = await db.query.userTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.primary_phone, body.phone)
      },
    })

    if (existedUserByPhoneNumber && existedUserByPhoneNumber.id !== session.id) {
      throw createError({ statusCode: 400, statusMessage: 'Phone number already in use' })
    }

    const [updatedUser] = await db.update(userTable)
      .set({
        primary_phone: body.phone,
        verified: true,
        updated_at: now,
      })
      .where(
        eq(userTable.id, session.id),
      )
      .returning()

    if (!updatedUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
    if (sessionId) {
      await storage.setItem(`session:${sessionId}`, {
        ...session,
        verified: true,
        primary_phone: updatedUser.primary_phone,
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
