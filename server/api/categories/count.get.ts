import { useCategoryCrud } from '@/server/composables/useCategoryCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const user_id = session.user!.id!
    const { countCategorys } = useCategoryCrud({ user_id })

    const total = await countCategorys()

    return total
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
