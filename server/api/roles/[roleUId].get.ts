import { useRoleCrud } from '~~/server/composables/useRoleCrud'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const { getRoleById } = useRoleCrud()

    const response = await getRoleById(roleUId)

    return response.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
