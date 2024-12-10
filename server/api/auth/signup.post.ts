import { Buffer } from 'node:buffer'
import { createHmac } from 'node:crypto'
import { useUser } from '@base/server/composables/useUser'
import bcrypt from 'bcrypt'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  try {
    const { email, password, phone, provider } = await readValidatedBody(
      event,
      z.object({
        provider: z.enum(['credentials'], { message: 'Invalid sign in provider' }).optional(),
        email: z.string().email().min(1, ErrorMessage.INVALID_CREDENTIALS),
        phone: z.string().optional(),
        password: z.string().min(6, ErrorMessage.INVALID_CREDENTIALS),
      }).parse,
    )

    const { createUser } = useUser()

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
      email_verified: provider === 'credentials' ? null : new Date(),
    })

    if (provider === 'credentials') {
      const runtimeConfig = useRuntimeConfig()
      const { sendMail } = useNodeMailer()
      const token = Buffer.from(`${email}^^${createHmac('sha256', runtimeConfig.auth.secret).update(email).digest('hex')}`).toString('base64')

      await sendMail({
        to: email,
        subject: 'Email Verification',
        text: `Please click on the link to verify your email: ${runtimeConfig.public.appBaseUrl}/auth/verify?token=${token}&type=verify&redirect_to=/auth/login`,
      })
    }

    nitroApp.hooks.callHook('log:info', {
      message: 'User signed up',
      data: sysUser,
    })

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    nitroApp.hooks.callHook('log:error', {
      message: 'User sign up failed',
      data: error,
    })

    throw parseError(error)
  }
})
