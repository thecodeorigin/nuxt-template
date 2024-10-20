import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const body = await readBody(event)

    const { createShortcut } = useShortcutCrud(userId)

    const userShortcut = await createShortcut(body)

    setResponseStatus(event, 201)

    return userShortcut
  }
  catch (error: any) {
    throw parseError(error)
  }
})
