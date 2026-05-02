import { spawn } from 'node:child_process'
import { createHmac } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const staticOnly = args.has('--static-only')
const shouldStartServer = !staticOnly && process.env.FUNCTIONAL_START_SERVER !== 'false'
const baseUrl = process.env.FUNCTIONAL_BASE_URL ?? 'http://127.0.0.1:3000'
const timeoutMs = Number.parseInt(process.env.FUNCTIONAL_TIMEOUT_MS ?? '180000', 10)
const authSessionSecret =
  process.env.AUTH_SESSION_SECRET ??
  readEnvValue('apps/next/.env', 'AUTH_SESSION_SECRET') ??
  readEnvValue('.env', 'AUTH_SESSION_SECRET') ??
  'dev-auth-secret-change-me'
const trustedRequestSecret =
  process.env.TRUSTED_REQUEST_BYPASS_SECRET ?? 'functional-storefront-trusted-request'

const visibleForbiddenPatterns = [
  { label: 'mock CMS copy', pattern: /Mock CMS hero content/i },
  { label: 'placeholder branding', pattern: /brand-logo-placeholder/i },
  { label: 'lorem ipsum copy', pattern: /lorem ipsum/i },
  { label: 'unfinished TODO copy', pattern: /\bTODO\b/i },
]

const staticChecks = [
  {
    label: 'CMS fallback has production-like hero copy',
    file: 'packages/adapters/mock/cms/index.ts',
    assert: (contents) => !/Mock CMS hero content/i.test(contents),
  },
  {
    label: 'CMS fallback uses uploaded brand asset',
    file: 'packages/adapters/mock/cms/index.ts',
    assert: (contents) => /\/uploads\/site-branding\/logo-en\.png/.test(contents),
  },
  {
    label: 'Catalog fallback carries Odoo external product IDs',
    file: 'packages/adapters/mock/product/generated-mock-erp-data.ts',
    assert: (contents) => (contents.match(/external_product_id/g) ?? []).length >= 20,
  },
  {
    label: 'Catalog fallback carries prices, inventory, and images',
    file: 'packages/adapters/mock/product/generated-mock-erp-data.ts',
    assert: (contents) =>
      (contents.match(/"price"/g) ?? []).length >= 20 &&
      (contents.match(/"stock"/g) ?? []).length >= 20 &&
      (contents.match(/"image"/g) ?? []).length >= 20,
  },
]

const liveChecks = [
  { label: 'home page', path: '/' },
  { label: 'shop page', path: '/shop' },
  { label: 'search page', path: '/search?q=cetaphil' },
  { label: 'product detail page', path: '/product/76959' },
  { label: 'cart page', path: '/cart' },
  { label: 'checkout page', path: '/checkout' },
  { label: 'order history page', path: '/orders' },
  { label: 'account page', path: '/account' },
  { label: 'catalog API', path: '/api/products?limit=12', json: true, validate: validateProductsApi },
  { label: 'search API', path: '/api/search?q=cetaphil', json: true, validate: validateSearchApi },
  { label: 'CMS home API', path: '/api/cms/home', json: true, validate: validateCmsApi },
]

function log(message) {
  console.log(`[functional-storefront] ${message}`)
}

function fail(message) {
  console.error(`[functional-storefront] FAIL: ${message}`)
  process.exitCode = 1
}

function readEnvValue(file, key) {
  const fullPath = join(rootDir, file)
  if (!existsSync(fullPath)) return null
  const contents = readFileSync(fullPath, 'utf8')
  const match = contents.match(new RegExp(`^${key}=(.*)$`, 'm'))
  if (!match) return null
  return match[1].trim().replace(/^["']|["']$/g, '') || null
}

function runStaticChecks() {
  for (const check of staticChecks) {
    const fullPath = join(rootDir, check.file)
    if (!existsSync(fullPath)) {
      fail(`${check.label}: missing ${check.file}`)
      continue
    }

    const contents = readFileSync(fullPath, 'utf8')
    if (!check.assert(contents)) {
      fail(check.label)
      continue
    }

    log(`PASS static: ${check.label}`)
  }
}

async function isServerReady() {
  try {
    const response = await fetch(baseUrl, { redirect: 'follow' })
    return response.status < 500
  } catch {
    return false
  }
}

async function waitForServer(startedAt = Date.now()) {
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReady()) return
    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 2000))
  }
  throw new Error(`Timed out waiting for ${baseUrl}`)
}

function startServer() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'yarn'
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'yarn web:dev'] : ['web:dev']

  return spawn(command, commandArgs, {
    cwd: rootDir,
    env: {
      ...process.env,
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ?? 'functional-storefront-local-secret-000000000000',
      AUTH_SESSION_SECRET: authSessionSecret,
      REQUIRE_PRODUCTION_AUTH: 'false',
      TRUSTED_REQUEST_BYPASS_SECRET: trustedRequestSecret,
      PORT: process.env.PORT ?? '3000',
    },
    stdio: 'inherit',
    detached: process.platform !== 'win32',
  })
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return
  if (process.platform === 'win32') {
    spawn('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    return
  }
  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch {
    child.kill('SIGTERM')
  }
}

async function fetchText(path) {
  const response = await fetch(new URL(path, baseUrl), { redirect: 'follow' })
  const text = await response.text()
  return { response, text }
}

function assertNoForbiddenText(label, text) {
  for (const forbidden of visibleForbiddenPatterns) {
    if (forbidden.pattern.test(text)) {
      throw new Error(`${label} contains ${forbidden.label}`)
    }
  }
}

function unwrapApiPayload(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data
  return payload
}

function validateProductsApi(payload) {
  const data = unwrapApiPayload(payload)
  const products = Array.isArray(data) ? data : data?.products
  if (!Array.isArray(products) || products.length < 8) {
    throw new Error('catalog API returned too few products')
  }
  const first = products[0]
  if (!first?.id || !first?.name || typeof first.price !== 'number') {
    throw new Error('catalog API product is missing id, name, or numeric price')
  }
}

function validateSearchApi(payload) {
  const data = unwrapApiPayload(payload)
  if (!Array.isArray(data?.suggestions)) {
    throw new Error('search API did not return suggestions')
  }
  if (!Array.isArray(data?.popularBrands)) {
    throw new Error('search API did not return popular brands')
  }
}

function validateCmsApi(payload) {
  const data = unwrapApiPayload(payload)
  const serialized = JSON.stringify(data)
  assertNoForbiddenText('CMS home API', serialized)
  if (!serialized.includes('/uploads/site-branding/logo-en.png')) {
    throw new Error('CMS home API did not expose uploaded branding')
  }
}

function createFunctionalSessionCookie() {
  const payload = {
    userId: 'u-1',
    email: 'user@realcosmetics.local',
    name: 'Customer User',
    role: 'customer',
    sessionId: 'functional-session',
    csrfToken: 'functional-csrf-token',
  }
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = createHmac('sha256', authSessionSecret).update(payloadBase64).digest('base64url')
  return `rc_auth_session=${payloadBase64}.${signature}`
}

function createPharmacistSessionCookie() {
  const payload = {
    userId: 'u-3',
    email: 'pharma@realcosmetics.local',
    name: 'Pharma User',
    role: 'pharmacist',
    sessionId: 'functional-pharmacist-session',
    csrfToken: 'functional-pharmacist-csrf-token',
  }
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = createHmac('sha256', authSessionSecret).update(payloadBase64).digest('base64url')
  return `rc_auth_session=${payloadBase64}.${signature}`
}

async function postJson(path, body, cookie) {
  const response = await fetch(new URL(path, baseUrl), {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'x-rc-trusted-request': trustedRequestSecret,
    },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}: ${text.slice(0, 240)}`)
  }
  return JSON.parse(text)
}

async function getJson(path, cookie) {
  const response = await fetch(new URL(path, baseUrl), {
    redirect: 'follow',
    headers: {
      Cookie: cookie,
    },
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}: ${text.slice(0, 240)}`)
  }
  return JSON.parse(text)
}

async function clearCart(cookie) {
  const current = unwrapApiPayload(await getJson('/api/cart', cookie))
  const items = Array.isArray(current?.items) ? current.items : []
  for (const item of items) {
    if (typeof item?.productId === 'string') {
      await postJson('/api/cart/remove', { productId: item.productId }, cookie)
    }
  }
}

async function runCheckoutFlow() {
  const cookie = createFunctionalSessionCookie()
  const productId = '76959'
  const quantity = 3
  const referralCode = 'GLOWWITHU1'
  const redeemPercent = 10
  const orderItems = [{ productId, quantity }]

  await clearCart(cookie)
  const cartAfterAdd = unwrapApiPayload(await postJson('/api/cart/add', { productId, quantity }, cookie))
  if (!Array.isArray(cartAfterAdd?.items) || !cartAfterAdd.items.some((item) => item.productId === productId)) {
    throw new Error('cart API did not retain added product')
  }
  log('PASS flow: add product to cart')

  const quote = unwrapApiPayload(
    await postJson(
      '/api/checkout/quote',
      {
        items: orderItems,
        fulfillment: { mode: 'delivery' },
        referralCode,
      },
      cookie,
    ),
  )
  if (!quote?.quoteId || typeof quote?.totals?.total !== 'number') {
    throw new Error('checkout quote did not return quoteId and totals')
  }
  if (!quote?.referral || quote.referral.code !== referralCode) {
    throw new Error('checkout quote did not retain referral pricing metadata')
  }
  log('PASS flow: create checkout quote with referral discount')

  const placedOrder = unwrapApiPayload(
    await postJson(
      '/api/orders/place',
      {
        pricingQuoteId: quote.quoteId,
        items: orderItems,
        contact: {
          fullName: 'Functional Customer',
          phone: '0790000000',
        },
        fulfillment: { mode: 'delivery' },
        payment: { method: 'cod' },
        loyalty: { redeemPercent },
        referralCode,
        address: {
          city: 'Amman',
          area: 'Sweifieh',
          building: 'Functional Tower',
        },
      },
      cookie,
    ),
  )
  if (!placedOrder?.id || placedOrder.status !== 'placed') {
    throw new Error('order placement did not return a placed order')
  }
  if (typeof placedOrder?.pricing?.discount !== 'number' || placedOrder.pricing.discount <= 0) {
    throw new Error('order placement did not apply referral/loyalty discounts')
  }
  log('PASS flow: place COD order with referral and loyalty')

  const orders = unwrapApiPayload(await getJson('/api/orders', cookie))
  if (!Array.isArray(orders) || !orders.some((order) => order.id === placedOrder.id)) {
    throw new Error('order history did not include the placed order')
  }
  log('PASS flow: order appears in order history')
}

async function runAccountRetentionFlow() {
  const cookie = createFunctionalSessionCookie()

  const referral = unwrapApiPayload(await getJson('/api/account/referral', cookie))
  if (!referral?.visible || referral.code !== 'GLOWWITHU1' || !referral.shareLink) {
    throw new Error('account referral summary did not expose the seeded referral profile')
  }
  log('PASS flow: account referral summary')

  const referralValidation = unwrapApiPayload(
    await postJson(
      '/api/referral/validate',
      {
        code: referral.code,
        cartSubtotal: 80,
        currency: 'USD',
      },
      cookie,
    ),
  )
  if (!referralValidation?.eligible || referralValidation.code !== referral.code) {
    throw new Error('referral validation did not accept the account referral code')
  }
  log('PASS flow: referral code validates')

  const referralApply = unwrapApiPayload(
    await postJson(
      '/api/referral/apply',
      {
        code: referral.code,
        cartSubtotal: 80,
        currency: 'USD',
      },
      cookie,
    ),
  )
  if (!referralApply?.applied || !referralApply.ledgerEntryId) {
    throw new Error('referral apply did not create pending attribution')
  }
  log('PASS flow: referral code applies')

  const loyalty = unwrapApiPayload(await getJson('/api/account/loyalty', cookie))
  if (!loyalty?.wallet || typeof loyalty.wallet.points !== 'number' || loyalty.wallet.points <= 0) {
    throw new Error('account loyalty wallet did not return points')
  }
  if (!Array.isArray(loyalty.wallet.redeemOptions) || loyalty.wallet.redeemOptions.length === 0) {
    throw new Error('account loyalty wallet did not return redeem options')
  }
  if (!Array.isArray(loyalty.history)) {
    throw new Error('account loyalty did not return history')
  }
  log('PASS flow: account loyalty wallet and history')

  const tests = unwrapApiPayload(await getJson('/api/account/tests', cookie))
  if (!Array.isArray(tests) || tests.length === 0) {
    throw new Error('account tests API did not return test history')
  }
  if (!tests.some((test) => test?.template?.type === 'skin')) {
    throw new Error('account tests API did not return a skin consultation template')
  }
  if (!tests.some((test) => test?.template?.type === 'hair')) {
    throw new Error('account tests API did not return a hair consultation template')
  }
  const selectedTest = tests.find((test) => typeof test?.id === 'string' && test.recommendedCount > 0) ?? tests[0]
  if (!selectedTest?.id) {
    throw new Error('account tests API returned an invalid test record')
  }
  log('PASS flow: account test history')

  const testDetail = unwrapApiPayload(await getJson(`/api/account/tests/${encodeURIComponent(selectedTest.id)}`, cookie))
  if (!testDetail?.id || !Array.isArray(testDetail.recommendedProducts)) {
    throw new Error('account test detail did not return recommended products')
  }
  if (testDetail.template?.type !== 'skin' && testDetail.template?.type !== 'hair') {
    throw new Error('account test detail did not return an explicit consultation template')
  }
  const recommendedProduct = testDetail.recommendedProducts.find((item) => item?.productId && item.inStock !== false)
  if (!recommendedProduct) {
    throw new Error('account test detail did not include an in-stock recommended product')
  }
  log('PASS flow: account test detail recommendations')

  await clearCart(cookie)
  const cartAfterRecommendationAdd = unwrapApiPayload(
    await postJson('/api/cart/add', { productId: recommendedProduct.productId, quantity: 1 }, cookie),
  )
  if (
    !Array.isArray(cartAfterRecommendationAdd?.items) ||
    !cartAfterRecommendationAdd.items.some((item) => item.productId === recommendedProduct.productId)
  ) {
    throw new Error('recommended product was not added to cart')
  }
  log('PASS flow: add recommended test product to cart')
}

async function runPharmacistOperatorFlow() {
  const cookie = createPharmacistSessionCookie()

  const customerResults = unwrapApiPayload(await getJson('/api/pharmacist/customers/search?q=Customer', cookie))
  if (!Array.isArray(customerResults) || !customerResults.some((item) => item.userId === 'u-1')) {
    throw new Error('pharmacist customer search did not return the seeded customer')
  }
  log('PASS flow: pharmacist customer search')

  const qrProfile = unwrapApiPayload(
    await postJson('/api/pharmacist/scan/resolve', { qrCode: 'QR-U1-2026' }, cookie),
  )
  if (qrProfile?.customer?.userId !== 'u-1' || !Array.isArray(qrProfile.tests)) {
    throw new Error('pharmacist QR resolve did not return the seeded customer profile')
  }
  log('PASS flow: pharmacist QR resolve')

  const customerProfile = unwrapApiPayload(await getJson('/api/pharmacist/customers/u-1', cookie))
  if (customerProfile?.customer?.userId !== 'u-1') {
    throw new Error('pharmacist customer profile did not load')
  }
  if (!customerProfile.tests?.some((test) => test?.template?.type === 'skin')) {
    throw new Error('pharmacist customer profile did not include skin template history')
  }
  log('PASS flow: pharmacist customer profile')

  const productResults = unwrapApiPayload(await getJson('/api/pharmacist/products/search?q=Gloss', cookie))
  if (!Array.isArray(productResults) || productResults.length === 0) {
    throw new Error('pharmacist product search did not return recommendations')
  }
  const recommendedProductIds = productResults.slice(0, 2).map((item) => item.id).filter(Boolean)
  if (recommendedProductIds.length === 0) {
    throw new Error('pharmacist product search returned invalid product ids')
  }
  log('PASS flow: pharmacist product search')

  const consultationPayload = {
    customerId: 'u-1',
    templateType: 'hair',
    title: 'Hair and scalp consultation',
    summary: 'Scalp dryness with mild flaking observed.',
    notes: 'Add a weekly hydrating scalp routine.',
    metrics: [
      { id: 'scalp_dryness', label: 'Scalp dryness', value: 'High' },
      { id: 'flake_level', label: 'Flaking', value: 'Mild' },
    ],
    recommendedProductIds,
  }

  const draft = unwrapApiPayload(await postJson('/api/pharmacist/consultations/draft', consultationPayload, cookie))
  if (draft?.template?.type !== 'hair' || !Array.isArray(draft.recommendedProducts) || draft.recommendedProducts.length === 0) {
    throw new Error('pharmacist draft did not preserve hair template and recommendations')
  }
  log('PASS flow: pharmacist hair consultation draft')

  const submitted = unwrapApiPayload(await postJson('/api/pharmacist/consultations/submit', consultationPayload, cookie))
  if (submitted?.template?.type !== 'hair' || submitted.status !== 'completed') {
    throw new Error('pharmacist consultation submit did not create completed hair test')
  }
  log('PASS flow: pharmacist hair consultation submit')

  const updatedProfile = unwrapApiPayload(await getJson('/api/pharmacist/customers/u-1', cookie))
  if (!updatedProfile.tests?.some((test) => test?.id === submitted.id && test?.template?.type === 'hair')) {
    throw new Error('pharmacist customer history did not include submitted hair consultation')
  }
  log('PASS flow: pharmacist submitted test appears in customer history')
}

async function runLiveChecks() {
  let child = null
  const alreadyRunning = await isServerReady()
  if (!alreadyRunning && shouldStartServer) {
    log(`starting web server for ${baseUrl}`)
    child = startServer()
  }

  try {
    await waitForServer()
    for (const check of liveChecks) {
      const { response, text } = await fetchText(check.path)
      if (!response.ok) {
        throw new Error(`${check.label} returned HTTP ${response.status}`)
      }

      assertNoForbiddenText(check.label, text)
      if (check.json) {
        const payload = JSON.parse(text)
        check.validate?.(payload)
      }

      log(`PASS live: ${check.label}`)
    }
    await runAccountRetentionFlow()
    await runPharmacistOperatorFlow()
    await runCheckoutFlow()
  } finally {
    stopServer(child)
  }
}

runStaticChecks()

if (!staticOnly && process.exitCode !== 1) {
  runLiveChecks().catch((error) => {
    fail(error instanceof Error ? error.message : String(error))
  })
}
