import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId, shortcutId } = await defineEventOptions(event, { auth: true, params: ['userId', 'shortcutId'] })

    const { deleteShortcutById } = useShortcutCrud(userId)

    const data = await deleteShortcutById(shortcutId)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
