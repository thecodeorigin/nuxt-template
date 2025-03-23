import { PaymentStatus, paymentProviderTransactionTable, userOrderTable, userPaymentTable } from '../db/schemas'

export function usePayment() {
  async function createOrder(creditPackageId: string, userId: string) {
    return (
      await db.insert(userOrderTable).values({
        credit_package_id: creditPackageId,
        user_id: userId,
      }).returning()
    )[0]
  }

  async function createPayment(orderId: string, userId: string, amount: number) {
    return (
      await db.insert(userPaymentTable).values({
        amount: String(amount),
        status: PaymentStatus.PENDING,
        user_id: userId,
        order_id: orderId,
      }).returning()
    )[0]
  }

  async function createProviderTransaction(paymentId: string, userId: string, provider: string, productType: string, productInfo: any) {
    return (
      await db.insert(paymentProviderTransactionTable).values({
        provider,
        provider_transaction_id: new Date().getTime().toString(),
        provider_transaction_status: PaymentStatus.PENDING,
        provider_transaction_info: `${productType}:${productInfo.amount}`,
        payment_id: paymentId,
        user_id: userId,
      }).returning()
    )[0]
  }

  return {
    createOrder,
    createPayment,
    createProviderTransaction,
  }
}
