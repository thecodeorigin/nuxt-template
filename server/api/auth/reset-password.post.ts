import { Buffer } from 'node:buffer'
import { createHmac } from 'node:crypto'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas'
import { useUser } from '@base/server/composables/useUser'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const { token, password } = await readValidatedBody(
      event,
      z.object({
        token: z.string().email().min(1, ErrorMessage.INVALID_VERIFICATION_URL),
        type: z.enum(['reset'], { message: ErrorMessage.INVALID_VERIFICATION_URL }),
        password: z.string().min(6, ErrorMessage.INVALID_CREDENTIALS),
        confirmPassword: z.string().min(6, ErrorMessage.INVALID_CREDENTIALS),
      })
        .refine(data => data.password === data.confirmPassword, {
          message: ErrorMessage.PASSWORD_MISMATCH,
        })
        .parse,
    )

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

    const { updateUserByEmail } = useUser()

    const hashedPassword = await bcrypt.hash(password, 10)

    await updateUserByEmail(email, { password: hashedPassword })

    setResponseStatus(event, 201)

    return {
      data: {
        message: 'Password reset successfully',
      },
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
