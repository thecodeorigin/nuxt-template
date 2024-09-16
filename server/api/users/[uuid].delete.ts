import { useUserCrud } from '~/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const { deleteUserById } = useUserCrud()

    const response = await deleteUserById(uuid)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})
