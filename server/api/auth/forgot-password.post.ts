import { createHmac } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { eq } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { email, type }: { email: string, type: string } = await readBody(event)

    if (type !== 'reset' || !email) {
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

    if (!sysUser) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.DONOT_HAVE_PERMISSION,
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const { sendMail } = useNodeMailer()
    const token = Buffer.from(`${email}^^${createHmac('sha256', runtimeConfig.auth.secret).update(`${email}reset`).digest('hex')}`).toString('base64')

    await sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Please click on the link to reset your password: ${runtimeConfig.public.appBaseUrl}/auth/reset-password?token=${token}&type=reset&redirect_to=/auth/login`,
    })

    setResponseStatus(event, 200)

    return {
      data: {
        message: 'Password reset link has been sent to your email',
      },
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
