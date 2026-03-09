import { ProviderResult } from './types'

export type Review = {
  id: string
  productId: string
  rating: number
  title: string
  body: string
  author: string
  createdAt: string
}

export interface ReviewProvider {
  listByProduct(productId: string): Promise<ProviderResult<Review[]>>
  add(input: {
    productId: string
    rating: number
    title: string
    body: string
    author: string
  }): Promise<ProviderResult<Review>>
}
