import { count, eq } from 'drizzle-orm'
import { categoryTable } from '@/server/db/schemas/category.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const categorySubquery = db.select().from(categoryTable)
      .where(
        eq(categoryTable.user_id, session.user!.id!),
      )

    const total = await db.select({ count: count() }).from(categorySubquery.as('count'))

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
