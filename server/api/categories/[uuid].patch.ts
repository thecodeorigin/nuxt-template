import { eq } from 'drizzle-orm'
import { categoryTable } from '~/server/db/schemas/category.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const body = await readBody(event)

    const category = await db.update(categoryTable)
      .set({ ...body, user_id: session.user!.id! })
      .where(eq(categoryTable.id, uuid))
      .returning()

    setResponseStatus(event, 201)

    return { data: category }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
