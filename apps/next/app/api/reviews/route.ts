import { reviewProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../_lib/response'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')?.trim()
    if (!productId) {
      return fail('INVALID_REVIEW_QUERY', 'productId is required.', 400)
    }

    const result = await reviewProvider.listByProduct(productId)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('REVIEW_LIST_UNEXPECTED', 'Unexpected error while fetching reviews.', 500, {
      scope: 'GET /api/reviews',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string
      rating?: number
      title?: string
      body?: string
      author?: string
    }

    if (
      !body.productId ||
      typeof body.rating !== 'number' ||
      !body.title ||
      !body.body ||
      !body.author
    ) {
      return fail(
        'INVALID_REVIEW_PAYLOAD',
        'productId, rating, title, body, and author are required.',
        400
      )
    }

    const result = await reviewProvider.add({
      productId: body.productId,
      rating: body.rating,
      title: body.title,
      body: body.body,
      author: body.author,
    })
    return matchProviderResult(result, {
      ok: (data) => ok(data, 201),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('REVIEW_CREATE_UNEXPECTED', 'Unexpected error while creating review.', 500, {
      scope: 'POST /api/reviews',
      cause,
    })
  }
}
