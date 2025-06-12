import { eq, sql, and, isNull } from 'drizzle-orm'
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

  async function createReference({
    userId,
    percentage,
    amount,
    quantity,
  }: {
    userId: string
    percentage?: number
    amount?: number
    quantity?: number | null
  }) {

    const reference = await db.insert(referenceTable).values({
      user_id: userId,
      percentage: percentage,
      amount: amount,
      quantity: quantity ?? null,
    }).returning()

    return reference[0]
  }

  async function deleteReferenceByUserId(userId: string) {
    const deletedReferences = await db
      .delete(referenceTable)
      .where(eq(referenceTable.user_id, userId))
      .returning();

    return deletedReferences;
  }

  async function getUnusedReferencesByUserId(userId: string) {
    const references = await db.select({
      reference: referenceTable,
    })
      .from(referenceTable)
      .leftJoin(referenceUsageTable, eq(referenceTable.id, referenceUsageTable.reference_id))
      .where(and(
        eq(referenceTable.user_id, userId),
        isNull(referenceUsageTable.id)
      ))

    return references.map((row) => row.reference)
  }

  async function isReferenceUsableByUser(refCode: string, userId: string): Promise<boolean> {
    const reference = await db.query.referenceTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.code, refCode)
      },
    })

    if (!reference) return false

    const isUsed = await db.query.referenceUsageTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.reference_id, reference.id)
      },
    })

    if (isUsed) return false

    const userUsedAnyRef = await db.query.referenceUsageTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.user_id, userId)
      },
    })

    if (userUsedAnyRef) return false

    return true
  }

  return {
    getReferenceById,
    getUserReferenceUsage,
    getUserBestPrice,
    createReferenceUsage,
    createReference,
    deleteReferenceByUserId,
    getUnusedReferencesByUserId,
    isReferenceUsableByUser
  }
}
