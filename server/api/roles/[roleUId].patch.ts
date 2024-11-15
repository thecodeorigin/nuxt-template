import { useRoleCrud } from '~~/server/composables/useRoleCrud'

export default defineEventHandler(async (event) => {
  try {
    const { roleUId } = await defineEventOptions(event, { auth: true, params: ['roleUId'] })

    const body = await readBody(event)

    const { updateRoleById } = useRoleCrud()

    const sysRole = await updateRoleById(roleUId, body)

    return { data: sysRole }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
