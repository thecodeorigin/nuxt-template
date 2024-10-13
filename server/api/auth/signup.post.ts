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
    })

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
