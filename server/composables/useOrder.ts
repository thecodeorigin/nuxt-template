export function useOrder() {
  async function getReferenceDiscountAmountForUser(orderId: string, userId: string): Promise<number> {
    const order = await db.query.orderTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.id, orderId)
      },
      with: {
        package: true,
        reference: true,
      },
    })

    if (!order || !order.package || !order.reference) return 0

    const price = order.package.price
    const reference = order.reference

    let discountedPrice = price

    if (reference.amount && reference.amount > 0) {
      discountedPrice = price - reference.amount
    } else if (reference.percentage && reference.percentage > 0) {
      discountedPrice = price * (1 - reference.percentage / 100)
    }

    const discountAmount = price - Math.max(0, Math.ceil(discountedPrice))

    return discountAmount
  }


  return {
    getReferenceDiscountAmountForUser
  }
}
