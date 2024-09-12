import { and, eq } from 'drizzle-orm'
import { categoryTable } from '~/server/db/schemas/category.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const category = await db.delete(categoryTable)
      .where(
        and(
          eq(categoryTable.user_id, session.user!.id!),
          eq(categoryTable.id, uuid),
        ),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: category[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})
