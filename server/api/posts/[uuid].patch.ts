import { eq } from 'drizzle-orm'
import { postTable } from '~/server/db/schemas/post.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const body = await readBody(event)

    const post = await db.update(postTable)
      .set({ ...body, user_id: session.user!.id! })
      .where(eq(postTable.id, uuid))
      .returning()

    setResponseStatus(event, 201)

    return { data: post }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
