import { and, eq } from 'drizzle-orm'
import { projectTable } from '@/server/db/schemas/project.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const project = await db.delete(projectTable)
      .where(
        and(
          eq(projectTable.user_id, session.user!.id!),
          eq(projectTable.id, uuid),
        ),
      )
      .returning()

    setResponseStatus(event, 201)

    return { data: project[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})
