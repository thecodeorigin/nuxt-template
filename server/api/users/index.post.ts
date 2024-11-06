import crypto from 'node:crypto'
import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readBody(event)

    const userData = {
      id: crypto.randomUUID(),
      ...body,
    }

    const { createUser } = useUserCrud()

    const response = await createUser(userData)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    console.error('Error creating user', error)
    throw parseError(error)
  }
})
