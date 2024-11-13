import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { getShortcutsPaginated } = useShortcutCrud(userUId)

    const userShortcuts = await getShortcutsPaginated({
      ...getFilter(event),
      sortBy: 'route',
    })

    return userShortcuts
  }
  catch (error: any) {
    throw parseError(error)
  }
})
