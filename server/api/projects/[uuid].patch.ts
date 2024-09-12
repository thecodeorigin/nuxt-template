import { eq } from 'drizzle-orm'
import { projectTable } from '~/server/db/schemas/project.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const body = await readBody(event)

    const project = await db.update(projectTable)
      .set({ ...body, user_id: session.user!.id! })
      .where(eq(projectTable.id, uuid))
      .returning()

    setResponseStatus(event, 201)

    return { data: project }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
