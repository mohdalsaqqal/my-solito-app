import { Review, ReviewProvider } from '@real/providers/contracts'

const reviewsStore: Review[] = [
  {
    id: 'rv-1',
    productId: '1',
    rating: 5,
    title: 'Visible results in one week',
    body: 'Excellent texture and fast results without irritation.',
    author: 'Sara A.',
    createdAt: '2026-02-18T10:00:00.000Z',
  },
  {
    id: 'rv-2',
    productId: '1',
    rating: 4,
    title: 'Great daily staple',
    body: 'Easy to use and fits into a daily routine.',
    author: 'Layan M.',
    createdAt: '2026-02-15T08:00:00.000Z',
  },
  {
    id: 'rv-3',
    productId: '3',
    rating: 5,
    title: 'Perfect shade payoff',
    body: 'Color is rich and comfortable for long wear.',
    author: 'Nour H.',
    createdAt: '2026-02-19T16:30:00.000Z',
  },
]

export const mockReviewAdapter: ReviewProvider = {
  async listByProduct(productId: string) {
    return {
      ok: true,
      data: reviewsStore.filter((item) => item.productId === productId),
    }
  },
  async add(input) {
    const rating = Math.max(1, Math.min(5, Math.round(input.rating)))
    if (!input.productId || !input.title.trim() || !input.body.trim() || !input.author.trim()) {
      return {
        ok: false,
        error: {
          code: 'INVALID_REVIEW_PAYLOAD',
          message: 'productId, title, body, and author are required.',
        },
      }
    }

    const created: Review = {
      id: `rv-${reviewsStore.length + 1}`,
      productId: input.productId,
      rating,
      title: input.title.trim(),
      body: input.body.trim(),
      author: input.author.trim(),
      createdAt: new Date().toISOString(),
    }
    reviewsStore.unshift(created)
    return { ok: true, data: created }
  },
}
