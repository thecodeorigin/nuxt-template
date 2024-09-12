import { projectTable } from '@/server/db/schemas/project.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const project = await db.insert(projectTable)
      .values({ ...body, user_id: session.user!.id! })
      .returning()

    setResponseStatus(event, 201)

    return { data: project[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
