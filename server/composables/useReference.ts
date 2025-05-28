import { eq, sql } from 'drizzle-orm'
import { referenceTable, referenceUsageTable } from '../db/schemas'

export const REFERENCE_CODE_COOKIE_NAME = 'referCode'

export function useReference() {
  function getReferenceById(referenceId: string) {
    return db.query.referenceTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.id, referenceId)
      },
    })
  }

  function getReferenceByCode(referenceCode: string) {
    return db.query.referenceTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.code, referenceCode)
      },
    })
  }

  function getUserReferenceUsage(userId: string) {
    return db.query.referenceUsageTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.user_id, userId)
      },
    })
  }

  async function getUserBestPrice(userId: string, originalPrice: number, discountPrice?: number | null, referCode?: string | null) {
    const userReferenceUsage = await getUserReferenceUsage(userId)

    let price = originalPrice

    if (!userReferenceUsage && referCode) {
      const reference = await getReferenceByCode(referCode)

      if (reference) {
        const referenceInStock = reference.quantity === null || reference.quantity > 0

        if (referenceInStock && reference?.percentage) {
          price = originalPrice * (1 - reference.percentage / 100)
        }
        else if (referenceInStock && reference?.amount) {
          price = originalPrice - reference.amount
        }
      }
    }

    // use the best price for the customer
    price = Math.ceil(
      discountPrice
        ? Math.min(discountPrice, price)
        : price,
    )

    if (!price) {
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.BAD_REQUEST,
      })
    }

    return price
  }

  async function createReferenceUsage(userId: string, referenceId: string, paymentProviderTransactionId: string) {
    const referenceUsage = await db.insert(referenceUsageTable).values({
      user_id: userId,
      reference_id: referenceId,
      payment_provider_transaction_id: paymentProviderTransactionId,
    }).returning()

    await db.update(referenceTable)
      .set({
        quantity: sql`${referenceTable.quantity} - 1`,
      })
      .where(eq(referenceTable.id, referenceId))

    return referenceUsage[0]
  }

  return {
    getReferenceById,
    getUserReferenceUsage,
    getUserBestPrice,
    createReferenceUsage,
  }
}
