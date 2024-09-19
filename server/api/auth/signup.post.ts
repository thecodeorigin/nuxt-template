import bcrypt from 'bcrypt'
import { customerTable } from '~/server/db/schemas/customer.schema'
import { useCategoryCrud } from '~/server/composables/useCategoryCrud'
import { useRoleCrud } from '~/server/composables/useRoleCrud'
import { useShortcutCrud } from '~/server/composables/useShortcutCrud'
import { useUserCrud } from '~/server/composables/useUserCrud'

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

    const { createCategory } = useCategoryCrud({ user_id: sysUser.data.id })

    const { createShortcut } = useShortcutCrud(sysUser.data.id)

    await Promise.all([
      createCategory({
        name: 'Uncategorized',
        slug: `uncategorized-${Date.now()}`,
      }),
      createShortcut({
        route: '/projects',
        user_id: sysUser.data.id,
      }),
      createShortcut({
        route: '/dashboard',
        user_id: sysUser.data.id,
      }),
    ])

    const stripeCustomer = await createStripeCustomer({ email })

    const freePrice = await getFreePrice()

    await createStripeSubscription(stripeCustomer.id, freePrice.data[0].id!)

    // insert stripe customer id to table customer
    await db.insert(customerTable)
      .values({
        user_id: sysUser.data.id,
        stripe_customer_id: stripeCustomer.id,
      })
      .returning()

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    console.error(error)
    setResponseStatus(event, 400, error.message)
  }
})
