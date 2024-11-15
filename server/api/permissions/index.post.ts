import { usePermissionCrud } from '~~/server/composables/usePermissionCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { createPermission } = usePermissionCrud()

    const sysPermission = await createPermission(body)

    setResponseStatus(event, 201)

    return {
      status: 'success',
      message: 'Permission has been created successfully',
      data: sysPermission,
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
