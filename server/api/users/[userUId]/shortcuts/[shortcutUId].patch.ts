import { eq } from 'drizzle-orm'
import { userShortcutTable } from '@base/server/db/schemas'
import { createInsertSchema } from 'drizzle-zod'

export default defineEventHandler(async (event) => {
  try {
    const { userUId, shortcutUId } = await defineEventOptions(event, { auth: true, params: ['userUId', 'shortcutUId'] })

    const body = await readValidatedBody(event, createInsertSchema(userShortcutTable).partial().parse)

    const userShortcut = await db.update(userShortcutTable)
      .set({ ...body, user_id: userUId })
      .where(eq(userShortcutTable.id, shortcutUId))
      .returning()

    setResponseStatus(event, 201)

    return { data: userShortcut }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
