import type Stripe from 'stripe'

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

  const freePrice = await getFreePrice()

  return {
    customer: stripeCustomer,
    subscription: await createStripeSubscription(stripeCustomer.id, freePrice.data[0].id!),
  }
}

export function updateStripeCustomer(customerId: string, customer: Stripe.CustomerUpdateParams) {
  return stripeAdmin.customers.update(customerId, customer)
}

export function upsertCustomer(customer: Stripe.CustomerCreateParams) {
  return stripeAdmin.customers.create(customer)
}
