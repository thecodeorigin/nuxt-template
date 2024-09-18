import { useCategoryCrud } from '@/server/composables/useCategoryCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })
    const user_id = session.user!.id!
    const body = await readBody(event)
    const { updateCategoryById } = useCategoryCrud({ user_id })
    const response = await updateCategoryById(uuid, body)

    setResponseStatus(event, 201)

    return { data: response.data }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
