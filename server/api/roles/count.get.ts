import { useRole } from '@base/server/composables/useRole'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getRoleCount } = useRole()

    return await getRoleCount(getFilter(event))
  }
  catch (error: any) {
    throw parseError(error)
  }
})
