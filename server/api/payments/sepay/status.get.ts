import { z } from 'zod'

import { PaymentStatus } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { description } = await getValidatedQuery(
      event,
      query => z.object({
        description: z.string().min(1, 'Payment description must be in the correct format!'),
      })
        .refine((query) => {
          const orderCode = query.description.slice(2)

          return orderCode.length === 16
        }, { message: 'Payment description must be in the correct format!' })
        .parse(query),
    )

    // remove the first 2 letters
    const orderCode = description.slice(2)

    const { getProviderTransactionByOrderCode } = usePayment()

    const paymentTransactionOfProvider = await getProviderTransactionByOrderCode(String(orderCode))

    return {
      data: {
        status: paymentTransactionOfProvider?.provider_transaction_status || PaymentStatus.PENDING,
      },
    }
  }
  catch (error: any) {
    logger.error('[Payment API] Error creating SePay checkout URL:', error)

    throw parseError(error)
  }
})
