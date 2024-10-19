import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import { omit } from 'lodash-es'
import { sysUserTable } from '@base/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    const { email, phone, password } = await readBody(event)

    if (!(email || phone) || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_CREDENTIALS,
        data: {
          email: [ErrorMessage.INVALID_CREDENTIALS],
        },
      })
    }

    const sysUser = await db.query.sysUserTable.findFirst({
      columns: {
        id: true,
        email: true,
        phone: true,
        password: true,
      },
      where: eq(sysUserTable.email, email),
    })

    if (!sysUser) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.INVALID_CREDENTIALS,
      })
    }

    const isValid = await bcrypt.compare(password, sysUser.password!)

    if (isValid) {
      setResponseStatus(event, 201)

      return { data: omit(sysUser, ['password']) }
    }

    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessage.INVALID_CREDENTIALS,
    })
  }
  catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage: error.message,
    })
  }
})
