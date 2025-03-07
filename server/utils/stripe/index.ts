import Stripe from 'stripe'

export * from './checkout'

export * from './customer'

export * from './portal'

export * from './price'

export * from './product'

export * from './subscription'

export function getStripeAdmin() {
  const config = useRuntimeConfig()

  if (config.public.features.subscription && !process.env.STRIPE_SECRET_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Subscription model is turned on but missing STRIPE_SECRET_KEY environment variable',
    })
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}
