import { categoryTable } from '@/server/db/schemas/category.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const category = await db.insert(categoryTable)
      .values({ ...body, user_id: session.user!.id! })
      .returning()

    setResponseStatus(event, 201)

    return { data: category[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
