export const usePaymentStore = defineStore('payment', () => {
  async function checkout(type: 'payos' | 'vnpay', productIdentifier: string) {
    if (type !== 'payos' && type !== 'vnpay')
      throw new Error('Invalid payment provider')

    const { data } = await $api<{
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

    return data
  }

  return {
    checkout,
  }
})
