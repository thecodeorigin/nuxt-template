import { z } from 'zod'

import { PaymentStatus } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    // description must be in format: uuid.uuid

    const { description } = await getValidatedQuery(
      event,
      query => z.object({
        description: z.string().min(1, 'Payment description must be in the correct format!'),
      })
        .refine((query) => {
          const [part1, part2] = query.description.split('.')

          return isUUID(part1) && isUUID(part2)
        }, { message: 'Payment description must be in the correct format!' })
        .parse(query),
    )

    const [orderCode] = description.split('.')

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
