export function useApiPayment() {
  function checkout(type: 'payos' | 'vnpay', productIdentifier: string) {
    if (type !== 'payos' && type !== 'vnpay')
      throw new Error('Invalid payment provider')

    return $api<{
      data: {
        message: string
        paymentUrl: string
      }
    }>(`api/payments/${type}/checkout`, {
      method: 'POST',
      body: {
        productIdentifier,
      },
    })
  }

  return {
    checkout,
  }
}
