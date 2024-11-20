import { useRole } from '@base/server/composables/useRole'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const { getRoleById } = useRole()

    const sysRole = await getRoleById(roleUId)

    return { data: sysRole }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
