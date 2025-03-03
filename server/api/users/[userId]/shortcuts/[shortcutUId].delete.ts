import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId, shortcutUId } = await defineEventOptions(event, { auth: true, params: ['userId', 'shortcutUId'] })

    const { deleteShortcutById } = useShortcutCrud(userId)

    const data = await deleteShortcutById(shortcutUId)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
