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

    const sysUser = (await db.select().from(sysUserTable)
      .where(
        or(
          ...[
            email && eq(sysUserTable.email, email),
            phone && eq(sysUserTable.phone, phone),
          ].filter(Boolean),
        ),
      ))[0]

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
    setResponseStatus(event, 401, error.message)
  }
})
