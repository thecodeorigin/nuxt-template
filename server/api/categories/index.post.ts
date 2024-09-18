import { useCategoryCrud } from '@/server/composables/useCategoryCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readBody(event)
    const user_id = session.user!.id!
    const { createCategory } = useCategoryCrud({ user_id })
    const response = await createCategory({ ...body, user_id })

    setResponseStatus(event, 201)

    return { data: response.data }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
