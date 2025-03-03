import type Stripe from 'stripe'
import { minBy } from 'lodash-es'

export async function getStripeCustomerByEmail(email: string) {
  return tryWithCache(
    getStorageStripeKey(`customer:${email}`),
    async () => {
      const { data: customers } = await getStripeAdmin().customers.list({
        email,
      })

      if (customers.length === 0)
        return

      return customers[0]
    },
  )
}

export function getStripeCustomerSubscriptions(customerUId: string) {
  return tryWithCache(
    getStorageStripeKey(`customer:${customerUId}:subscriptions`),
    async () => {
      const response = await getStripeAdmin().subscriptions.list({
        customer: customerUId,
        expand: [],
      })

      return response.data
    },
  )
}

export function createStripeCustomer(payload: {
  email: string
  phone?: string
  name?: string
}) {
  return getStripeAdmin().customers.create({
    email: payload.email,
    phone: payload.phone,
    name: payload.name,
  })
}

export async function createStripeCustomerOnSignup(email: string) {
  const nitroApp = useNitroApp()

  const stripeCustomer = await createStripeCustomer({ email })

  const products = await getStripeAllProducts()

  const prices = await getStripeAllPrices(products[0].id!)

  const freePrice = minBy(prices, 'unit_amount')

  if (!freePrice) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessage.STRIPE_NO_PRICE,
    })
  }

  console.log(`${email} (${stripeCustomer.id}) has signed up for ${freePrice.id} (${freePrice.unit_amount} ${freePrice.currency})`)

  nitroApp.hooks.callHook('log:info', {
    message: 'Stripe customer created on signup',
    data: {
      email,
      stripeCustomer,
      freePrice,
    },
  })

  return {
    customer: stripeCustomer,
    subscription: await createStripeSubscription(stripeCustomer.id, freePrice.id!),
  }
}

export async function updateStripeCustomer(customerUId: string, customer: Stripe.CustomerUpdateParams) {
  const response = await getStripeAdmin().customers.update(customerUId, customer)

  clearCache(getStorageStripeKey(`customer:${response.email}`))

  return response
}

export function upsertCustomer(customer: Stripe.CustomerCreateParams) {
  clearCache(getStorageStripeKey(`customer:${customer.email}`))

  return getStripeAdmin().customers.create(customer)
}
