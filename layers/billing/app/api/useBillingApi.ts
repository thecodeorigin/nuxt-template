import type { Invoice, OrganizationBillingSettings } from '#layers/billing/server/db/schema'
import type { CreateInvoice, UpdateBillingSettings } from '#layers/billing/shared/schemas/invoice'

export function useBillingApi() {
  function fetchBalance() {
    return $http<{ balance: number }>('/api/payments/billing/balance')
  }

  function fetchTransactions(page = 1, limit = 20) {
    return $http<{ items: unknown[], page: number, limit: number }>(`/api/payments/billing/transactions?page=${page}&limit=${limit}`)
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

  function fetchBillingSettings() {
    return $http<OrganizationBillingSettings>('/api/organization/invoice/settings')
  }

  function updateBillingSettings(body: UpdateBillingSettings) {
    return $http<OrganizationBillingSettings>('/api/organization/invoice/settings', { method: 'PATCH', body })
  }

  function fetchInvoices() {
    return $http<Invoice[]>('/api/organization/invoice')
  }

  function createInvoice(body: CreateInvoice) {
    return $http<Invoice>('/api/organization/invoice', { method: 'POST', body })
  }

  return { fetchBalance, fetchTransactions, checkout, fetchTransactionStatus, fetchBillingSettings, updateBillingSettings, fetchInvoices, createInvoice }
}
