import type Stripe from 'stripe'
import { minBy } from 'lodash-es'

export async function getStripeCustomerByEmail(email: string) {
  const { data: customers } = await stripeAdmin.customers.list({
    email,
  })

  if (customers.length === 0)
    return

  return customers[0]
}

export function getStripeCustomerSubscriptions(customerId: string) {
  return stripeAdmin.subscriptions.list({
    customer: customerId,
    expand: [],
  })
}

export function createStripeCustomer(payload: {
  email: string
  phone?: string
  name?: string
}) {
  return stripeAdmin.customers.create({
    email: payload.email,
    phone: payload.phone,
    name: payload.name,
  })
}

export async function createStripeCustomerOnSignup(email: string) {
  const stripeCustomer = await createStripeCustomer({ email })

  const { data } = await getStripeAllProducts()

  const prices = await getStripeAllPrices(data[0].id!)

  const freePrice = minBy(prices.data, 'unit_amount')

  if (!freePrice) {
    throw new Error('No prices found')
  }

  return {
    customer: stripeCustomer,
    subscription: await createStripeSubscription(stripeCustomer.id, freePrice.id!),
  }
}

export function updateStripeCustomer(customerId: string, customer: Stripe.CustomerUpdateParams) {
  return stripeAdmin.customers.update(customerId, customer)
}

export function upsertCustomer(customer: Stripe.CustomerCreateParams) {
  return stripeAdmin.customers.create(customer)
}
