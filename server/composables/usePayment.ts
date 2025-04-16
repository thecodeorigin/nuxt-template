import { eq } from 'drizzle-orm'
import { PaymentStatus, orderTable, paymentProviderTransactionTable, paymentTable } from '../db/schemas'
import type { Order, Payment, PaymentProviderTransaction } from '../types/models'

export function usePayment() {
  async function createOrder(productId: string, userId: string): Promise<Order> {
    return (
      await db.insert(orderTable).values({
        product_id: productId,
        user_id: userId,
      }).returning()
    )[0]
  }

  async function createPayment(orderId: string, userId: string, amount: number): Promise<Payment> {
    return (
      await db.insert(paymentTable).values({
        amount: String(amount),
        status: PaymentStatus.PENDING,
        user_id: userId,
        order_id: orderId,
      }).returning()
    )[0]
  }

  function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return db.update(paymentTable).set({
      status,
    }).where(
      eq(paymentTable.id, paymentId),
    )
  }

  async function createProviderTransaction(
    paymentId: string,
    userId: string,
    orderCode: number,
    provider: string,
    productType: string,
    productInfo: Record<string, any>,
  ): Promise<PaymentProviderTransaction> {
    return (
      await db.insert(paymentProviderTransactionTable).values({
        provider,
        provider_transaction_id: String(orderCode),
        provider_transaction_status: PaymentStatus.PENDING,
        provider_transaction_info: `${productType}:${productInfo.amount}`,
        payment_id: paymentId,
        user_id: userId,
      }).returning()
    )[0]
  }

  function getProviderTransactionByOrderCode(orderCode: string): Promise<
    | (PaymentProviderTransaction & {
      payment: Payment & {
        order: Order & {
          package: any
        }
      }
    })
    | undefined
  > {
    return db.query.paymentProviderTransactionTable.findFirst({
      where: eq(paymentProviderTransactionTable.provider_transaction_id, orderCode),
      with: {
        payment: {
          with: {
            order: {
              with: {
                package: true,
              },
            },
          },
        },
      },
    })
  }

  function updateProviderTransactionStatus(transactionId: string, status: PaymentStatus, resolvedAt: string | Date | number) {
    return db.update(paymentProviderTransactionTable).set({
      provider_transaction_status: status,
      provider_transaction_resolved_at: new Date(resolvedAt),
    }).where(
      eq(paymentProviderTransactionTable.id, transactionId),
    )
  }

  return {
    createOrder,
    createPayment,
    updatePaymentStatus,
    createProviderTransaction,
    getProviderTransactionByOrderCode,
    updateProviderTransactionStatus,
  }
}
