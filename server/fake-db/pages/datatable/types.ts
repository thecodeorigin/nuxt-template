export interface SalesDetails {
  product: Product
  buyer: Buyer
  date: string
  payment: Payment
}

export interface Product {
  id: number
  name: string
  slug: string
  brand: string
  category: string
  price: number
  image: string
  hasFreeShipping: boolean
  rating: number
  description: string
}

export interface Buyer {
  name: string
  avatar: string | null
}

export interface Payment {
  total: number
  receivedPaymentStatus: string
  paidAmount: number
  status: string
}
