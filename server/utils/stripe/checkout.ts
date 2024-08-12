function calculateTrialEndUnixTimestamp(trialPeriodDays?: number | null) {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null
    || trialPeriodDays === undefined
    || trialPeriodDays < 2
  ) {
    return undefined
  }

  const currentDate = new Date() // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000,
  ) // Add trial days
  return Math.floor(trialEnd.getTime() / 1000) // Convert to Unix timestamp in seconds
};

export async function createStripeCheckoutSession(customerId: string, priceId: string, redirectPath: string) {
  const price = await getStripePrice(priceId)

  return stripeAdmin.checkout.sessions.create({
    mode: price.type === 'recurring' ? 'subscription' : 'payment',
    subscription_data: price.type === 'recurring'
      ? {
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel',
            },
          },
          trial_end: calculateTrialEndUnixTimestamp(price.recurring?.trial_period_days),
        }
      : undefined,
    allow_promotion_codes: true,
    payment_method_collection: 'if_required',
    billing_address_collection: 'auto',
    customer: customerId,
    customer_update: {
      address: 'auto',
    },
    line_items: [
      {
        price: price.id,
        quantity: Number((price!.metadata as any).amount) || 1,
      },
    ],
    cancel_url: getURL(),
    success_url: getURL(redirectPath),
  })
}
