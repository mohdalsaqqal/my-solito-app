import {
  AccountTestDetail,
  AccountTestRecord,
  AccountTestTemplate,
  PharmacistConsultationDraft,
  PharmacistConsultationInput,
  PharmacistCustomerProfile,
  PharmacistCustomerSummary,
  PharmacistProvider,
  SKIN_QUESTIONNAIRE_FIELDS,
  HAIR_QUESTIONNAIRE_FIELDS,
} from '@real/providers/contracts'

const now = Date.now()

const skinTemplate: AccountTestTemplate = {
  type: 'skin',
  label: 'Skin consultation',
  description: 'Skin barrier, hydration, oil balance, and sensitivity review.',
  fields: SKIN_QUESTIONNAIRE_FIELDS,
}

const hairTemplate: AccountTestTemplate = {
  type: 'hair',
  label: 'Hair and scalp consultation',
  description: 'Scalp comfort, dryness, flakes, density, and hair routine review.',
  fields: HAIR_QUESTIONNAIRE_FIELDS,
}

function resolveTemplate(type: PharmacistConsultationInput['templateType']) {
  return type === 'hair' ? hairTemplate : skinTemplate
}

type MockProduct = {
  id: string
  brand?: string
  name: string
  price: number
  currency: string
  imageUrl?: string
  inStock?: boolean
}

function toRecommendedProduct(product: MockProduct): AccountTestDetail['recommendedProducts'][number] {
  return {
    productId: product.id,
    brand: product.brand,
    name: product.name,
    price: product.price,
    currency: product.currency,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
  }
}

function recommendedProductAt(index: number): AccountTestDetail['recommendedProducts'][number] {
  const product = mockProductCatalog[index]
  if (!product) {
    throw new Error(`Mock pharmacist product ${index} is not seeded.`)
  }
  return toRecommendedProduct(product)
}

const mockProductCatalog: MockProduct[] = [
  {
    id: '1',
    brand: 'Yves Saint Laurent',
    name: 'Libre Berry Crush Eau De Parfum',
    price: 42,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=80&h=80&q=80',
    inStock: true,
  },
  {
    id: '2',
    brand: 'IGK',
    name: 'Expensive Hi-Shine Gloss Treatment',
    price: 28,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1626015365107-2c06f0d654ad?auto=format&fit=crop&w=80&h=80&q=80',
    inStock: true,
  },
  {
    id: '3',
    brand: 'Fenty Beauty',
    name: 'Gloss Bomb Stix High-Shine Gloss Stick',
    price: 24,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=80&h=80&q=80',
    inStock: true,
  },
  {
    id: '4',
    brand: 'Huda Beauty',
    name: 'Faux Filler Extra Shine Lip Gloss',
    price: 21,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=80&h=80&q=80',
    inStock: true,
  },
  {
    id: '5',
    brand: 'Dior',
    name: 'Addict Lip Glow Oil Berry',
    price: 34,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1614859475299-814f0f47fd62?auto=format&fit=crop&w=80&h=80&q=80',
    inStock: true,
  },
  {
    id: '6',
    brand: 'Rare Beauty',
    name: 'Soft Pinch Tinted Lip Oil',
    price: 22,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1607602132700-068258d00519?auto=format&fit=crop&w=80&h=80&q=80',
    inStock: false,
  },
]

const customers = new Map<string, PharmacistCustomerSummary>([
  [
    'u-1',
    {
      userId: 'u-1',
      name: 'Customer User',
      email: 'user@realcosmetics.local',
      phone: '+962798680016',
      qrCode: 'QR-U1-2026',
      testCount: 2,
      lastTestAt: new Date(now - 3 * 86_400_000).toISOString(),
    },
  ],
  [
    'u-4',
    {
      userId: 'u-4',
      name: 'Maya Ali',
      email: 'maya.ali@realcosmetics.local',
      phone: '+962790001100',
      qrCode: 'QR-U4-2026',
      testCount: 1,
      lastTestAt: new Date(now - 7 * 86_400_000).toISOString(),
    },
  ],
])

const customerIdByQrCode = new Map<string, string>([
  ['RC-U1-2026-9X2K', 'u-1'],
  ['RC-U4-2026-B3N8', 'u-4'],
  ['QR-U1-2026', 'u-1'],
  ['QR-U4-2026', 'u-4'],
])

const testsByCustomerId = new Map<string, AccountTestDetail[]>([
  [
    'u-1',
    [
      {
        id: 'test-u1-1',
        template: skinTemplate,
        title: 'Core skin diagnostics',
        createdAt: new Date(now - 3 * 86_400_000).toISOString(),
        status: 'completed',
        pharmacistName: 'Dr. Sara',
        branchName: 'Abdali Branch',
        summary: 'Skin barrier is slightly compromised with mild dehydration.',
        notes: 'Use gentle cleanser and barrier-repair moisturizer for 4 weeks.',
        metrics: [
          { id: 'hydration', label: 'Hydration', value: 'Low' },
          { id: 'oiliness', label: 'Oiliness', value: 'Balanced' },
          { id: 'sensitivity', label: 'Sensitivity', value: 'Mild' },
        ],
        recommendedProducts: [
          recommendedProductAt(0),
          recommendedProductAt(2),
          recommendedProductAt(5),
        ],
      },
      {
        id: 'test-u1-2',
        template: skinTemplate,
        title: 'Skin balance follow-up',
        createdAt: new Date(now - 14 * 86_400_000).toISOString(),
        status: 'follow_up',
        pharmacistName: 'Dr. Sara',
        branchName: 'Abdali Branch',
        summary: 'Hydration improved, minor sensitivity remains around cheeks.',
        notes: 'Continue routine and recheck in 30 days.',
        metrics: [
          { id: 'hydration', label: 'Hydration', value: 'Medium' },
          { id: 'oiliness', label: 'Oiliness', value: 'Balanced' },
          { id: 'sensitivity', label: 'Sensitivity', value: 'Mild' },
        ],
        recommendedProducts: [recommendedProductAt(1)],
      },
    ],
  ],
  [
    'u-4',
    [
      {
        id: 'test-u4-1',
        template: hairTemplate,
        title: 'Hair and scalp check',
        createdAt: new Date(now - 7 * 86_400_000).toISOString(),
        status: 'completed',
        pharmacistName: 'Dr. Omar',
        branchName: 'Sweifieh Branch',
        summary: 'Scalp dryness with mild flaking observed.',
        notes: 'Hydrating treatment + weekly scalp routine.',
        metrics: [
          { id: 'dryness', label: 'Dryness', value: 'High' },
          { id: 'flake_level', label: 'Flaking', value: 'Mild' },
        ],
        recommendedProducts: [recommendedProductAt(1), recommendedProductAt(3)],
      },
    ],
  ],
])

function toTestRecord(detail: AccountTestDetail): AccountTestRecord {
  return {
    id: detail.id,
    template: detail.template,
    title: detail.title,
    createdAt: detail.createdAt,
    status: detail.status,
    recommendedCount: detail.recommendedProducts.length,
    purchasedCount: 0,
  }
}

function filterProducts(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return mockProductCatalog.slice(0, 6)
  return mockProductCatalog.filter((item) => {
    const haystack = `${item.brand ?? ''} ${item.name}`.toLowerCase()
    return haystack.includes(q)
  })
}

function findCustomerByQuery(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return Array.from(customers.values())
  }
  return Array.from(customers.values()).filter((item) => {
    const normalizedQr = item.qrCode.toLowerCase()
    return (
      item.userId.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      normalizedQr.includes(q)
    )
  })
}

function createDraft(input: PharmacistConsultationInput): PharmacistConsultationDraft | null {
  const customer = customers.get(input.customerId)
  if (!customer) return null

  const recommendedProducts = input.recommendedProductIds
    .map((id) => mockProductCatalog.find((item) => item.id === id))
    .filter((item): item is MockProduct => Boolean(item))
    .map((item) => ({
      productId: item.id,
      brand: item.brand,
      name: item.name,
      price: item.price,
      currency: item.currency,
      imageUrl: item.imageUrl,
      inStock: item.inStock,
    }))

  return {
    customer,
    template: resolveTemplate(input.templateType),
    title: input.title.trim(),
    summary: input.summary.trim(),
    notes: input.notes?.trim() || undefined,
    metrics: input.metrics,
    questionnaire: input.questionnaire,
    recommendedProducts,
  }
}

export const mockPharmacistAdapter: PharmacistProvider = {
  async searchCustomers(query) {
    return { ok: true, data: findCustomerByQuery(query) }
  },

  async getCustomerProfile(customerId) {
    const customer = customers.get(customerId)
    if (!customer) {
      return {
        ok: false,
        error: {
          code: 'PHARMACIST_CUSTOMER_NOT_FOUND',
          message: 'Customer profile was not found.',
        },
      }
    }

    const tests = (testsByCustomerId.get(customerId) ?? []).map(toTestRecord)
    return {
      ok: true,
      data: {
        customer: {
          ...customer,
          testCount: tests.length,
          lastTestAt: tests[0]?.createdAt,
        },
        tests,
      },
    }
  },

  async searchProducts(query) {
    const data = filterProducts(query).map((item) => ({
      id: item.id,
      brand: item.brand,
      name: item.name,
      price: item.price,
      currency: item.currency,
      imageUrl: item.imageUrl,
    }))
    return { ok: true, data }
  },

  async createConsultationDraft(input) {
    if (!input.customerId || !input.title.trim() || !input.summary.trim()) {
      return {
        ok: false,
        error: {
          code: 'PHARMACIST_DRAFT_INVALID',
          message: 'Customer, title, and summary are required.',
        },
      }
    }

    const draft = createDraft(input)
    if (!draft) {
      return {
        ok: false,
        error: {
          code: 'PHARMACIST_CUSTOMER_NOT_FOUND',
          message: 'Customer profile was not found.',
        },
      }
    }

    return { ok: true, data: draft }
  },

  async resolveCustomerByQr(qrCode) {
    const normalized = qrCode.trim()
    if (!normalized) {
      return {
        ok: false,
        error: {
          code: 'PHARMACIST_QR_INVALID',
          message: 'QR code is required.',
        },
      }
    }
    const customerId = customerIdByQrCode.get(normalized)
    if (!customerId) {
      return {
        ok: false,
        error: {
          code: 'PHARMACIST_QR_NOT_FOUND',
          message: 'No customer found for this QR code.',
        },
      }
    }
    return this.getCustomerProfile(customerId)
  },

  async submitConsultation(input) {
    const draft = createDraft(input.consultation)
    if (!draft) {
      return {
        ok: false,
        error: {
          code: 'PHARMACIST_CUSTOMER_NOT_FOUND',
          message: 'Customer profile was not found.',
        },
      }
    }
    if (draft.recommendedProducts.length === 0) {
      return {
        ok: false,
        error: {
          code: 'PHARMACIST_RECOMMENDATIONS_REQUIRED',
          message: 'At least one recommended product is required.',
        },
      }
    }

    const detail: AccountTestDetail = {
      id: `test-${draft.customer.userId}-${Date.now()}`,
      template: draft.template,
      title: draft.title,
      createdAt: new Date().toISOString(),
      status: 'completed',
      pharmacistName: input.pharmacistName,
      branchName: input.branchName,
      summary: draft.summary,
      notes: draft.notes,
      metrics: draft.metrics,
      questionnaire: draft.questionnaire,
      recommendedProducts: draft.recommendedProducts,
    }

    const current = testsByCustomerId.get(draft.customer.userId) ?? []
    testsByCustomerId.set(draft.customer.userId, [detail, ...current])
    const updated = customers.get(draft.customer.userId)
    if (updated) {
      customers.set(draft.customer.userId, {
        ...updated,
        testCount: current.length + 1,
        lastTestAt: detail.createdAt,
      })
    }
    customerIdByQrCode.set(draft.customer.qrCode, draft.customer.userId)

    return { ok: true, data: detail }
  },
}
