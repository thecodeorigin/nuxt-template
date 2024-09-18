import { useUserCrud } from '~/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const body = await readBody(event)

    const { updateUserById } = useUserCrud()

    const response = await updateUserById(uuid, body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
