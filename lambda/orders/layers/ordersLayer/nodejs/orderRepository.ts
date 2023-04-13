export interface OrderProduct {
  code: string,
  price: number
}

export interface Order {
  pk: string,
  sk?: string,
  createdAt?: number,
  shipping: {
    type: 'URGENT' | 'ECONOMIC',
    carrier: 'CORREIOS' | 'FEDEX'
  },
  billing: {
    payment: 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD',
    totalPrice: number
  },
  products: OrderProduct[]
}
