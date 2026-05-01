import assert from 'node:assert/strict'
import test from 'node:test'
import type { AuthSession, PharmacistProvider } from '@real/providers/contracts'
import {
  resolvePharmacistCustomerByQr,
  searchPharmacistCustomers,
  submitPharmacistConsultation,
} from './pharmacist-consultation.service'

const pharmacistSession: AuthSession = {
  userId: 'pharma-1',
  email: 'pharma@realcosmetics.local',
  name: 'Pharma User',
  role: 'pharmacist',
}

const customerSession: AuthSession = {
  userId: 'customer-1',
  email: 'user@realcosmetics.local',
  name: 'Customer User',
  role: 'customer',
}

function createProvider(overrides: Partial<PharmacistProvider> = {}): PharmacistProvider {
  return {
    async searchCustomers() {
      return { ok: true, data: [] }
    },
    async getCustomerProfile() {
      return {
        ok: false,
        error: { code: 'PHARMACIST_CUSTOMER_NOT_FOUND', message: 'Customer profile was not found.' },
      }
    },
    async searchProducts() {
      return { ok: true, data: [] }
    },
    async createConsultationDraft() {
      return {
        ok: false,
        error: { code: 'PHARMACIST_DRAFT_INVALID', message: 'Draft invalid.' },
      }
    },
    async resolveCustomerByQr() {
      return {
        ok: false,
        error: { code: 'PHARMACIST_QR_NOT_FOUND', message: 'QR was not found.' },
      }
    },
    async submitConsultation() {
      return {
        ok: false,
        error: { code: 'PHARMACIST_CUSTOMER_NOT_FOUND', message: 'Customer profile was not found.' },
      }
    },
    ...overrides,
  }
}

test('pharmacist service denies non-pharmacist users before provider access', async () => {
  let providerCalled = false
  const provider = createProvider({
    async searchCustomers() {
      providerCalled = true
      return { ok: true, data: [] }
    },
  })

  const result = await searchPharmacistCustomers(customerSession, 'maya', provider)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.error.code, 'AUTH_FORBIDDEN')
  }
  assert.equal(providerCalled, false)
})

test('pharmacist service trims QR input before resolving customer profile', async () => {
  let receivedQr = ''
  const provider = createProvider({
    async resolveCustomerByQr(qrCode) {
      receivedQr = qrCode
      return {
        ok: true,
        data: {
          customer: {
            userId: 'u-1',
            name: 'Customer User',
            email: 'user@realcosmetics.local',
            qrCode,
            testCount: 0,
          },
          tests: [],
        },
      }
    },
  })

  const result = await resolvePharmacistCustomerByQr(pharmacistSession, '  QR-U1-2026  ', provider)

  assert.equal(result.ok, true)
  assert.equal(receivedQr, 'QR-U1-2026')
})

test('pharmacist service submits consultation with staff identity and normalized product ids', async () => {
  let submitted: Parameters<PharmacistProvider['submitConsultation']>[0] | null = null
  const provider = createProvider({
    async submitConsultation(input) {
      submitted = input
      return {
        ok: true,
        data: {
          id: 'test-1',
          template: {
            type: 'skin',
            label: 'Skin consultation',
            description: 'Skin template',
          },
          title: input.consultation.title,
          createdAt: '2026-04-26T00:00:00.000Z',
          status: 'completed',
          pharmacistName: input.pharmacistName,
          branchName: input.branchName,
          summary: input.consultation.summary,
          metrics: input.consultation.metrics,
          recommendedProducts: [],
        },
      }
    },
  })

  const result = await submitPharmacistConsultation(
    pharmacistSession,
    {
      customerId: 'u-1',
      title: ' Skin check ',
      summary: ' Barrier support ',
      metrics: [{ id: 'hydration', label: 'Hydration', value: 'Low' }],
      questionnaire: {
        skinType: 'combination',
        sensitivityLevel: 3,
      },
      recommendedProductIds: ['p-1', 42],
    },
    provider,
  )

  assert.equal(result.ok, true)
  assert.deepEqual(submitted, {
    pharmacistName: 'Pharma User',
    branchName: 'Main Branch',
    consultation: {
      customerId: 'u-1',
      templateType: 'skin',
      title: ' Skin check ',
      summary: ' Barrier support ',
      notes: '',
      metrics: [{ id: 'hydration', label: 'Hydration', value: 'Low' }],
      questionnaire: {
        skinType: 'combination',
        sensitivityLevel: 3,
      },
      recommendedProductIds: ['p-1'],
    },
  })
})
