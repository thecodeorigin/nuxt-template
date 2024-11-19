import { usePermissionCrud } from '~~/server/composables/usePermissionCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { createPermission } = usePermissionCrud()

    const response = await createPermission(body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
