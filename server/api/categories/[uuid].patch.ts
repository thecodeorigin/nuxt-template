import { useCategoryCrud } from '@/server/composables/useCategoryCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })
    const user_id = session.user!.id!
    const body = await readBody(event)

    if (body) {
      if (body.created_at)
        body.created_at = new Date(body.created_at)
      if (body.updated_at)
        body.updated_at = new Date(body.updated_at)
    }
    const { updateCategoryById } = useCategoryCrud({ user_id })
    const response = await updateCategoryById(uuid, body)

    setResponseStatus(event, 201)

    return { data: response.data }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
