import { Buffer } from 'node:buffer'
import { createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas'
import { useUser } from '@base/server/composables/useUser'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const { token } = await readValidatedBody(
      event,
      z.object({
        token: z.string().min(1, ErrorMessage.INVALID_VERIFICATION_URL),
        type: z.enum(['verify'], { message: ErrorMessage.INVALID_VERIFICATION_URL }),
      }).parse,
    )

    const runtimeConfig = useRuntimeConfig()

    const [email, hash] = Buffer.from(token, 'base64').toString().split('^^')

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

    const { updateUserByEmail } = useUser()

    await updateUserByEmail(email, { email_verified: new Date() })

    setResponseStatus(event, 201)

    return {
      data: {
        message: 'Email verified successfully',
      },
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
