import { count, eq } from 'drizzle-orm'
import { projectTable } from '~/server/db/schemas/project.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const projectSubquery = db.select().from(projectTable)
      .where(
        eq(projectTable.user_id, session.user!.id!),
      )

    const total = await db.select({ count: count() }).from(projectSubquery.as('count'))

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
