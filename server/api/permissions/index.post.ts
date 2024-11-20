import { usePermission } from '@base/server/composables/usePermission'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { createPermission } = usePermission()

    const response = await createPermission(body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
