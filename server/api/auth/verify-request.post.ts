import { Buffer } from 'node:buffer'
import { createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas/sys_users.schema'
import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { token, type }: { token: string, type: string } = await readBody(event)

    if (type !== 'verify') {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.DONOT_HAVE_PERMISSION,
      })
    }

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.DONOT_HAVE_PERMISSION,
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const [email, hash] = Buffer.from(token, 'base64').toString('utf-8').split('.')

    const isValid = createHmac('sha256', runtimeConfig.auth.secret).update(email).digest('hex') === hash
    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.INVALID_VERIFICATION_URL,
      })
    }

    const sysUser = await db.query.sysUserTable.findFirst({
      columns: {
        id: true,
        email: true,
        email_verified: true,
      },
      where: eq(sysUserTable.email, email),
    })

    if (!sysUser || sysUser.email_verified) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.DONOT_HAVE_PERMISSION,
      })
    }

    const { updateUserByEmail } = useUserCrud()
    await updateUserByEmail(email, { email_verified: new Date() })

    setResponseStatus(event, 201)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
