import { and, eq } from 'drizzle-orm'
import { postTable } from '@/server/db/schemas/post.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const post = await db.delete(postTable)
      .where(
        and(
          eq(postTable.user_id, session.user!.id!),
          eq(postTable.id, uuid),
        ),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: post[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})
