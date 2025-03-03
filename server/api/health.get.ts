import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    await db.execute(sql`SELECT 1`)

    return { success: true }
  }
  catch (error: any) {
    throw createError({
      statusCode: 503,
      statusMessage: error.message,
    })
  }
})
