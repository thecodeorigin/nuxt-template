import bcrypt from 'bcrypt'
import { useRoleCrud } from '@materialize/server/composables/useRoleCrud'
import { useUserCrud } from '@materialize/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { email, phone, password, provider = 'credentials' } = await readBody(event)

    if (!(email || phone) || !password) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Email or Phone and Password is required to signup',
        data: {
          email: ['Email or Phone and Password is required to signup'],
        },
      })
    }

    const { getRoleByName } = useRoleCrud()

    const editorRole = await getRoleByName('Editor')

    if (!editorRole.data?.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot sign up user!',
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
      role_id: editorRole.data.id,
    })

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    console.error(error)
    setResponseStatus(event, 400, error.message)
  }
})
