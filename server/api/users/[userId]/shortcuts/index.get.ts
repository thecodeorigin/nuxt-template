import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const { getShortcutsPaginated } = useShortcutCrud(userId)

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
