import { count, eq } from 'drizzle-orm'
import { postTable } from '@/server/db/schemas/post.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const postSubquery = db.select().from(postTable)
      .where(
        eq(postTable.user_id, session.user!.id!),
      )

    const total = await db.select({ count: count() }).from(postSubquery.as('count'))

    return {
      total,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
