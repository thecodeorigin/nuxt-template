import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'
import { createInsertSchema } from 'drizzle-zod'
import { userShortcutTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const body = await readValidatedBody(event, createInsertSchema(userShortcutTable).partial().parse)

    const { createShortcut } = useShortcutCrud(userUId)

    const userShortcut = await createShortcut({ ...body, user_id: userUId })

    setResponseStatus(event, 201)

    return userShortcut
  }
  catch (error: any) {
    throw parseError(error)
  }
})
