import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createStorefrontServiceContextFromRequest,
  createStorefrontServiceRequest,
} from './storefront-service-context'

test('createStorefrontServiceContextFromRequest derives locale, store, and preview token from request state', () => {
  const request = new Request(
    'http://internal.local/api/search?q=lipstick&previewToken=preview-demo',
    {
      headers: {
        'accept-language': 'ar-JO,ar;q=0.9,en;q=0.8',
        'x-store-id': 'amman-store',
      },
    },
  )

  const context = createStorefrontServiceContextFromRequest(request)

  assert.equal(context.requestUrl, request.url)
  assert.equal(context.locale, 'ar')
  assert.equal(context.storeId, 'amman-store')
  assert.equal(context.previewToken, 'preview-demo')
  assert.equal(new Headers(context.requestHeaders).get('x-store-id'), 'amman-store')
})

test('createStorefrontServiceRequest preserves request headers for server auth resolution', () => {
  const request = createStorefrontServiceRequest({
    requestUrl: 'http://internal.local/api/cms/home',
    requestHeaders: {
      cookie: 'better-auth.session_token=session-1',
    },
  })

  assert.equal(request.headers.get('cookie'), 'better-auth.session_token=session-1')
})
