import { filter, maxBy } from 'lodash-es'

export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const customer = await getStripeCustomerByEmail(session.user.email as string)

  const { data: subscriptions } = await getStripeCustomerSubscriptions(customer.id)

  const activeSubscriptions = filter(subscriptions, { status: 'active' })

  const maxSubscription = maxBy(activeSubscriptions, sub => sub.items.data[0].price.unit_amount)

  return {
    customer,
    subscription: maxSubscription,
    subscriptions,
  }
})
