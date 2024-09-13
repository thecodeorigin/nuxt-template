import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export default defineEventHandler(async (event) => {
  try {
    const { email, phone, password } = await readBody(event)

    if (!(email || phone) || !password) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Email or Phone and Password is required to signup',
        data: {
          email: ['Email or Phone and Password is required to signup'],
        },
      })
    }

    await defineEventOptions(event, { auth: true })

    const sysUser = (await db.select().from(sysUserTable)
      .where(
        or(
          ...[
            email && eq(sysUserTable.email, email),
            phone && eq(sysUserTable.phone, phone),
          ].filter(Boolean),
        ),
      ))[0]

    const isValid = await bcrypt.compare(password, sysUser.password!)

    if (isValid) {
      setResponseStatus(event, 201)

      return { data: sysUser }
    }

    setResponseStatus(event, 401, 'Invalid credentials!')
  }
  catch (error: any) {
    setResponseStatus(event, 400, error.message)
  }
})
