import { useProjectCrud } from '@/server/composables/useProjectCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const queryRestrict = { user_id: session.user!.id! }
    const { countProjects } = useProjectCrud(queryRestrict)
    const total = await countProjects()

    return {
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
