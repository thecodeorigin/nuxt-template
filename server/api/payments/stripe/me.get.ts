import type Stripe from 'stripe'
import { filter, maxBy } from 'lodash-es'

export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  let subscriptions: Stripe.Subscription[] = []

  let customer = await getStripeCustomerByEmail(session.user.email as string)

  if (!customer) {
    const { subscription, customer: newCustomer } = await createStripeCustomerOnSignup(session.user.email as string)

    customer = newCustomer

    if (subscription)
      subscriptions.push(subscription)
  }
  else {
    subscriptions = await getStripeCustomerSubscriptions(customer.id)
  }

  const activeSubscriptions = filter(subscriptions, { status: 'active' })

  const maxSubscription = maxBy(activeSubscriptions, sub => sub.items.data[0].price.unit_amount)

  return {
    customer,
    subscription: maxSubscription,
    subscriptions,
  }
})
