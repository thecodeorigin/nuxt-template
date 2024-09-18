import { useCategoryCrud } from '@/server/composables/useCategoryCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const { parent_id } = getFilter(event)

    const queryRestrict = { user_id: session.user!.id!, parent_id }
    const { getCategorysPaginated, countCategorys } = useCategoryCrud(queryRestrict)
    const response = await getCategorysPaginated(getFilter(event))
    console.log('response:', response)
    const total = await countCategorys()

    return {
      data: response.data,
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
