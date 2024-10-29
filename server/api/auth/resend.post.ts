import { createHmac } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { eq } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    const { email, type }: { email: string, type: string } = await readBody(event)

    if (type !== 'resend' || !email) {
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
  }
  catch (error: any) {
    throw parseError(error)
  }
})
