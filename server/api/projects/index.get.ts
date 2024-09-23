import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const query = getFilter(event)
    const queryRestrict = { user_id: session.user!.id!, category_id: query.category }
    const { getProjectsPaginated } = useProjectCrud(queryRestrict)
    const projects = await getProjectsPaginated(query)

    return projects
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
