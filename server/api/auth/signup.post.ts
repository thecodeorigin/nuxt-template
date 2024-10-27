import { createHmac } from 'node:crypto'
import { Buffer } from 'node:buffer'
import bcrypt from 'bcrypt'
import { useRoleCrud } from '@base/server/composables/useRoleCrud'
import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { email, phone, password, provider = 'credentials' } = await readBody(event)

    if (!(email || phone) || !password) {
      throw createError({
        statusCode: 403,
        statusMessage: ErrorMessage.INVALID_CREDENTIALS,
        data: {
          email: [ErrorMessage.INVALID_CREDENTIALS],
        },
      })
    }

    const { getRoleByName } = useRoleCrud()

    const userRole = await getRoleByName('User')

    if (!userRole.data?.id) {
      throw createError({
        statusCode: 403,
        statusMessage: ErrorMessage.CANNOT_FIND_ROLE,
      })
    }

    const { createUser } = useUserCrud()

    const sysUser = await createUser({
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      language: '',
      country: '',
      city: '',
      postcode: '',
      address: '',
      organization: '',
      provider,
      role_id: userRole.data.id,
      emailVerified: provider === 'credentials' ? null : new Date(),
    })

    if (provider === 'credentials') {
      const runtimeConfig = useRuntimeConfig()
      const { sendMail } = useNodeMailer()
      const token = Buffer.from(`${email}.${createHmac('sha256', runtimeConfig.auth.secret).update(email).digest('hex')}`).toString('base64')

      await sendMail({
        from: runtimeConfig.EMAIL_FROM,
        to: email,
        subject: 'Email Verification',
        text: `Please click on the link to verify your email: ${runtimeConfig.public.appBaseUrl}/auth/verify?token=${token}&type=verify&redirect_to=/auth/login`,
      })
    }

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    throw parseError(error)
  }
})
