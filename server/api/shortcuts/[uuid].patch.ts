import { eq } from 'drizzle-orm'
import { userShortcutTable } from '@/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const body = await readBody(event)

    const userShortcut = await db.update(userShortcutTable)
      .set({ ...body, user_id: session.user!.id! })
      .where(eq(userShortcutTable.id, uuid))
      .returning()

    setResponseStatus(event, 201)

    return { data: userShortcut }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
