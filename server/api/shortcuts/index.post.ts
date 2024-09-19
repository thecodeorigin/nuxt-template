import { useShortcutCrud } from '~/server/composables/useShortcutCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { createShortcut } = useShortcutCrud(session.user!.id!)

    const userShortcut = await createShortcut(body)

    setResponseStatus(event, 201)

    return userShortcut
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
