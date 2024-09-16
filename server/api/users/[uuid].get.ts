import { eq } from 'drizzle-orm'
import { useUserCrud } from '~/server/composables/useUserCrud'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const { getUserById } = useUserCrud()

    const response = await getUserById(uuid)

    setResponseStatus(event, 200)

    return response
  }
  catch (error: any) {
    setResponseStatus(event, 404, error.message)
  }
})
