import { useRole } from '@base/server/composables/useRole'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const body = await readBody(event)

    const { updateRoleById } = useRole()

    const sysRole = await updateRoleById(roleUId, body)

    return { data: sysRole }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
