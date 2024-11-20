import { useRole } from '@base/server/composables/useRole'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const { createRole } = useRole()

    const response = await createRole(body)

    setResponseStatus(event, 201)

    return response.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
