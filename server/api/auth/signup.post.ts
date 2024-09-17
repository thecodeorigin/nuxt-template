import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { omit } from 'lodash-es'
import { sysRoleTable } from '~/server/db/schemas/sys_roles.schema'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'
import { customerTable } from '~/server/db/schemas/customer.schema'

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

    const editorRole = (await db.select().from(sysRoleTable)
      .where(
        eq(sysRoleTable.name, 'Editor'),
      )
      .limit(1))[0]

    if (!editorRole?.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot sign up user!',
      })
    }

    const sysUser = await db.insert(sysUserTable)
      .values({
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
        role_id: editorRole.id,
      })
      .returning()

    const stripeCustomer = await createStripeCustomer({ email })

    const freePrice = await getFreePrice()

    await createStripeSubscription(stripeCustomer.id, freePrice.data[0].id!)

    // insert stripe customer id to table customer
    await db.insert(customerTable)
      .values({
        user_id: sysUser[0].id,
        stripe_customer_id: stripeCustomer.id,
      })
      .returning()

    setResponseStatus(event, 201)

    return { data: omit(sysUser[0], ['password']) }
  }
  catch (error: any) {
    console.error(error)
    setResponseStatus(event, 400, error.message)
  }
})
