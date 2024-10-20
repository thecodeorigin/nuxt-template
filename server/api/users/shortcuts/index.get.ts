import { useShortcutCrud } from '@base/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getShortcutsPaginated } = useShortcutCrud(session.user!.id!)

    const userShortcuts = await getShortcutsPaginated({
      ...getFilter(event),
      sortBy: 'route',
    })

    return userShortcuts
  }
  catch (error: any) {
    console.log(error)

    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
