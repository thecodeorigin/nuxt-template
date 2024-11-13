import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId, shortcutUId } = await defineEventOptions(event, { auth: true, params: ['userUId', 'shortcutUId'] })

    const { deleteShortcutById } = useShortcutCrud(userUId)

    const data = await deleteShortcutById(shortcutUId)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
