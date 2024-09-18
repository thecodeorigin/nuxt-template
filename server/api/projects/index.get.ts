import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const queryRestrict = { user_id: session.user!.id! }
    const { getProjectsPaginated, countProjects } = useProjectCrud(queryRestrict)
    const projects = await getProjectsPaginated(getFilter(event))
    const total = await countProjects()

    return {
      data: projects.data,
      total,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
