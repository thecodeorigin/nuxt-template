import { postTable } from '@/server/db/schemas/post.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const post = await db.insert(postTable)
      .values({ ...body, user_id: session.user!.id! })
      .returning()

    setResponseStatus(event, 201)

    return { data: post[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
