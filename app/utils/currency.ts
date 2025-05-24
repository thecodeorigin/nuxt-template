export function formatPrice(price: number, currency: string) {
  if (currency !== 'USD' && currency !== 'VND') {
    return price
  }

  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(price)
}
