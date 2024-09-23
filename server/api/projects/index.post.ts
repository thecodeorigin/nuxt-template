import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const body = await readBody(event)
    const queryRestrict = { user_id: session.user!.id! }
    const { createProject } = useProjectCrud(queryRestrict)
    const respnose = await createProject({ ...body, user_id: session.user!.id! })

    setResponseStatus(event, 201)

    return respnose.data
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
