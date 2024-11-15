import { useRoleCrud } from '~~/server/composables/useRoleCrud'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const { deleteRoleById } = useRoleCrud()

    const sysRole = await deleteRoleById(roleUId)

    setResponseStatus(event, 201)

    return {
      status: 'success',
      message: sysRole.message,
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
