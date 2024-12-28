import Stripe from 'stripe'

export * from './checkout'

export * from './customer'

export * from './portal'

export * from './price'

export * from './product'

export * from './subscription'

export const stripeAdmin = new Stripe(process.env.STRIPE_SECRET_KEY!)
