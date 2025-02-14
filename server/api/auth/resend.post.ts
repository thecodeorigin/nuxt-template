import { createHmac } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { eq } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readValidatedBody(
      event,
      z.object({
        email: z.string().email().min(1, ErrorMessage.INVALID_VERIFICATION_URL),
        type: z.enum(['resend'], { message: ErrorMessage.INVALID_VERIFICATION_URL }),
      }).parse,
    )

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

    if (sysUser.email_verified) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.EMAIL_ALREADY_VERIFIED,
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const { sendMail } = useNodeMailer()
    const token = Buffer.from(`${email}^^${createHmac('sha256', runtimeConfig.auth.secret).update(email).digest('hex')}`).toString('base64')

    await sendMail({
      to: email,
      subject: 'Email Verification',
      text: `Please click on the link to verify your email: ${runtimeConfig.public.appBaseUrl}/auth/verify?token=${token}&type=verify&redirect_to=/auth/login`,
    })

    setResponseStatus(event, 200)

    return {
      data: {
        message: 'Another confirmation email has been sent to your email address!',
      },
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})
