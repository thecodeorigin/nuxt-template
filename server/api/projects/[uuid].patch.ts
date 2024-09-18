import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })
    const user_id = session.user!.id!
    const body = await readBody(event)
    const { updateProjectById } = useProjectCrud({ user_id })
    const response = await updateProjectById(uuid, body)

    setResponseStatus(event, 201)

    return { data: response.data }
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
