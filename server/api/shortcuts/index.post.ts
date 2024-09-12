import { userShortcutTable } from '~/server/db/schemas/user_shortcuts.schema'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const userShortcut = await db.insert(userShortcutTable)
      .values({ ...body, user_id: session.user!.id! })
      .returning()

    setResponseStatus(event, 201)

    return { data: userShortcut[0] }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
