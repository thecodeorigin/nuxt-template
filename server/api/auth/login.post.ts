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
        statusMessage: 'Email or Phone and Password is required to signup',
        data: {
          email: ['Email or Phone and Password is required to signup'],
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
        statusMessage: 'Invalid credentials!',
      })
    }

    const isValid = await bcrypt.compare(password, sysUser.password!)

    if (isValid) {
      setResponseStatus(event, 201)

      return { data: omit(sysUser, ['password']) }
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials!',
    })
  }
  catch (error: any) {
    setResponseStatus(event, 401, error.message)
  }
})
