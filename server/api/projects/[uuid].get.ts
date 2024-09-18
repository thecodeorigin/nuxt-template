import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const user_id = session.user!.id!
    const { getProjectById } = useProjectCrud({ user_id })
    const response = await getProjectById(uuid)

    setResponseStatus(event, 201)

    return { data: response.data }
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})
