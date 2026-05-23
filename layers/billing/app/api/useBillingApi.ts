export function useBillingApi() {
  function fetchBalance() {
    return $http<{ balance: number }>('/api/payments/billing/balance')
  }

  function checkout(amount: number) {
    return $http<{
      transactionId: string
      orderCode: string
      amount: number
      qrUrl: string
      bank: { bankName: string, accountNumber: string, prefix: string }
      expiresAt: string
    }>('/api/payments/sepay/checkout', { method: 'POST', body: { amount } })
  }

  function fetchTransactionStatus(id: string) {
    return $http<{ id: string, status: string }>(`/api/payments/sepay/status?id=${id}`)
  }

  return { fetchBalance, checkout, fetchTransactionStatus }
}
