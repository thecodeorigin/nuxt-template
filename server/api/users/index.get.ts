import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getUsersPaginated } = useUserCrud()

    const response = await getUsersPaginated(getFilter(event))

    setResponseStatus(event, 200)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
