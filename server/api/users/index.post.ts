import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { createUser } = useUserCrud()

    const response = await createUser(body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
