import { Buffer } from 'node:buffer'
import { createHmac } from 'node:crypto'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas/sys_users.schema'
import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { token, password, confirmPassword, type }: { token: string, password: string, confirmPassword: string, type: string } = await readBody(event)

    if (type !== 'reset' || !token) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.INVALID_VERIFICATION_URL,
      })
    }

    if (!password || password !== confirmPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.PASSWORD_MISMATCH,
      })
    }

    const runtimeConfig = useRuntimeConfig()

    const [email, hash] = Buffer.from(token, 'base64').toString().split('^^')

    const isValid = createHmac('sha256', runtimeConfig.auth.secret).update(`${email}reset`).digest('hex') === hash
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
        password: true,
      },
      where: eq(sysUserTable.email, email),
    })

    if (!sysUser) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.DONOT_HAVE_PERMISSION,
      })
    }

    const { updateUserByEmail } = useUserCrud()

    const hashedPassword = await bcrypt.hash(password, 10)

    await updateUserByEmail(email, { password: hashedPassword })

    setResponseStatus(event, 201)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
