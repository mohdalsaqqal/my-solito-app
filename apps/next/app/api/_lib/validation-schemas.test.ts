import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PharmacistConsultationBodySchema,
  PharmacistScanResolveBodySchema,
} from './validation-schemas'

test('PharmacistScanResolveBodySchema accepts qrCode and trims it', () => {
  const result = PharmacistScanResolveBodySchema.safeParse({ qrCode: '  QR-U1-2026  ' })

  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.qrCode, 'QR-U1-2026')
  }
})

test('PharmacistScanResolveBodySchema rejects legacy barcode-only payload', () => {
  const result = PharmacistScanResolveBodySchema.safeParse({ barcode: 'QR-U1-2026' })

  assert.equal(result.success, false)
})

test('PharmacistConsultationBodySchema accepts recommendation ids used by live routes', () => {
  const result = PharmacistConsultationBodySchema.safeParse({
    customerId: 'u-1',
    title: 'Skin check',
    summary: 'Barrier support',
    notes: '',
    metrics: [{ id: 'hydration', label: 'Hydration', value: 'Low' }],
    recommendedProductIds: ['p-1', 'p-2'],
  })

  assert.equal(result.success, true)
  if (result.success) {
    assert.deepEqual(result.data.recommendedProductIds, ['p-1', 'p-2'])
  }
})
