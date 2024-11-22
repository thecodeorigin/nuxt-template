import { useRole } from '@base/server/composables/useRole'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const { deleteRoleById } = useRole()

    await deleteRoleById(roleUId)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
