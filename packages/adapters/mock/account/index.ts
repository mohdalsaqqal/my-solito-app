import {
  AccountAddress,
  AccountTestDetail,
  AccountOverview,
  AccountProvider,
  AccountTestRecord,
  AuthRole,
  LoyaltyBarcode,
  LoyaltyHistoryEntry,
  LoyaltyRulesInput,
  LoyaltyTierRule,
  LoyaltyWallet,
  WishlistItem,
} from '@real/providers/contracts'

const now = Date.now()

const addressesByUserId = new Map<string, AccountAddress[]>([
  [
    'u-1',
    [
      {
        id: 'addr-u1-1',
        label: 'Home',
        city: 'Amman',
        area: 'Dabouq',
        building: 'Building 12',
        floor: '3',
        apartment: '9',
        isDefault: true,
      },
    ],
  ],
  [
    'u-2',
    [
      {
        id: 'addr-u2-1',
        label: 'HQ',
        city: 'Amman',
        area: 'Abdali',
        building: 'Admin Tower',
        isDefault: true,
      },
    ],
  ],
  [
    'u-3',
    [
      {
        id: 'addr-u3-1',
        label: 'Clinic',
        city: 'Amman',
        area: 'Sweifieh',
        building: 'Dermacenter',
        isDefault: true,
      },
    ],
  ],
])

const loyaltyHistoryByUserId = new Map<string, LoyaltyHistoryEntry[]>([
  [
    'u-1',
    [
      {
        id: 'lh-u1-1',
        title: 'Order purchase',
        pointsDelta: 40,
        createdAt: new Date(now - 86_400_000).toISOString(),
      },
      {
        id: 'lh-u1-2',
        title: 'Points redemption',
        pointsDelta: -120,
        createdAt: new Date(now - 4 * 86_400_000).toISOString(),
      },
    ],
  ],
  [
    'u-2',
    [
      {
        id: 'lh-u2-1',
        title: 'Order purchase',
        pointsDelta: 15,
        createdAt: new Date(now - 2 * 86_400_000).toISOString(),
      },
    ],
  ],
  [
    'u-3',
    [
      {
        id: 'lh-u3-1',
        title: 'Order purchase',
        pointsDelta: 20,
        createdAt: new Date(now - 3 * 86_400_000).toISOString(),
      },
    ],
  ],
])

const wishlistByUserId = new Map<string, WishlistItem[]>([
  [
    'u-1',
    [
      {
        id: 'p-1',
        brand: 'Yves Saint Laurent',
        name: 'Yves Saint Laurent - Libre Berry Crush Eau De Parfum',
        price: 42,
        currency: 'USD',
        imageUrl:
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        id: 'p-3',
        brand: 'Dior',
        name: 'Dior - Addict Lip Glow Oil Berry',
        price: 34,
        currency: 'USD',
        imageUrl:
          'https://images.unsplash.com/photo-1614859475299-814f0f47fd62?auto=format&fit=crop&w=80&h=80&q=80',
      },
    ],
  ],
  ['u-2', []],
  ['u-3', []],
])

const testsByUserId = new Map<string, AccountTestRecord[]>([
  [
    'u-1',
    [
      {
        id: 'test-u1-1',
        title: 'Core skin diagnostics',
        createdAt: new Date(now - 3 * 86_400_000).toISOString(),
        status: 'completed',
        recommendedCount: 3,
        purchasedCount: 1,
      },
      {
        id: 'test-u1-2',
        title: 'Skin balance follow-up',
        createdAt: new Date(now - 14 * 86_400_000).toISOString(),
        status: 'follow_up',
        recommendedCount: 2,
        purchasedCount: 2,
      },
    ],
  ],
  ['u-2', []],
  [
    'u-3',
    [
      {
        id: 'test-u3-1',
        title: 'Pharmacist internal sample test',
        createdAt: new Date(now - 7 * 86_400_000).toISOString(),
        status: 'completed',
        recommendedCount: 1,
        purchasedCount: 0,
      },
    ],
  ],
])

const qrByUserId = new Map<string, string>([
  ['u-1', 'RC-U1-2026-9X2K'],
  ['u-2', 'RC-U2-2026-A7Q4'],
  ['u-3', 'RC-U3-2026-M5P1'],
])

const testDetailsByUserId = new Map<string, AccountTestDetail[]>([
  [
    'u-1',
    [
      {
        id: 'test-u1-1',
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
          {
            productId: '1',
            brand: 'Yves Saint Laurent',
            name: 'Libre Berry Crush Eau De Parfum',
            price: 42,
            currency: 'USD',
            imageUrl:
              'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=80&h=80&q=80',
            inStock: true,
          },
          {
            productId: '3',
            brand: 'Fenty Beauty',
            name: 'Gloss Bomb Stix High-Shine Gloss Stick',
            price: 24,
            currency: 'USD',
            imageUrl:
              'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=80&h=80&q=80',
            inStock: true,
          },
          {
            productId: '6',
            brand: 'Rare Beauty',
            name: 'Soft Pinch Tinted Lip Oil',
            price: 22,
            currency: 'USD',
            imageUrl:
              'https://images.unsplash.com/photo-1607602132700-068258d00519?auto=format&fit=crop&w=80&h=80&q=80',
            inStock: false,
          },
        ],
      },
      {
        id: 'test-u1-2',
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
        recommendedProducts: [
          {
            productId: '2',
            brand: 'IGK',
            name: 'Expensive Hi-Shine Gloss Treatment',
            price: 28,
            currency: 'USD',
            imageUrl:
              'https://images.unsplash.com/photo-1626015365107-2c06f0d654ad?auto=format&fit=crop&w=80&h=80&q=80',
            inStock: true,
          },
        ],
      },
    ],
  ],
  ['u-2', []],
  [
    'u-3',
    [
      {
        id: 'test-u3-1',
        title: 'Pharmacist internal sample test',
        createdAt: new Date(now - 7 * 86_400_000).toISOString(),
        status: 'completed',
        pharmacistName: 'Dr. Omar',
        branchName: 'Sweifieh Branch',
        summary: 'Demo record for pharmacist role.',
        metrics: [{ id: 'status', label: 'Status', value: 'Demo' }],
        recommendedProducts: [],
      },
    ],
  ],
])

type LoyaltyState = {
  points: number
  tier: string
  currency: string
  expiringSoonPoints: number
  expiringSoonAt: string | null
}

const DEFAULT_POINT_TO_CURRENCY = 0.03
const DEFAULT_EARN_RATE_PER_CURRENCY = 1
const DEFAULT_REDEEM_OPTIONS = [
  { percent: 10, pointsCost: 120 },
  { percent: 25, pointsCost: 280 },
  { percent: 50, pointsCost: 620 },
]
const DEFAULT_TIER_THRESHOLDS = {
  loyal: 2000,
  gold: 900,
}

type ResolvedLoyaltyRules = {
  pointToCurrency: number
  earnRatePerCurrency: number
  tiers: LoyaltyTierRule[]
  tierThresholds: {
    loyal: number
    gold: number
  }
  redeemOptions: Array<{
    percent: number
    pointsCost: number
  }>
}

const loyaltyStateByUserId = new Map<string, LoyaltyState>([
  [
    'u-1',
    {
      points: 420,
      tier: 'Silver',
      currency: 'USD',
      expiringSoonPoints: 80,
      expiringSoonAt: new Date(now + 14 * 86_400_000).toISOString(),
    },
  ],
  [
    'u-2',
    {
      points: 2100,
      tier: 'Loyal',
      currency: 'USD',
      expiringSoonPoints: 120,
      expiringSoonAt: new Date(now + 21 * 86_400_000).toISOString(),
    },
  ],
  [
    'u-3',
    {
      points: 860,
      tier: 'Gold',
      currency: 'USD',
      expiringSoonPoints: 40,
      expiringSoonAt: new Date(now + 10 * 86_400_000).toISOString(),
    },
  ],
])

const barcodeByUserId = new Map<string, LoyaltyBarcode>([
  ['u-1', { code: 'LOY-U1-8842', expiresAt: new Date(now + 30 * 86_400_000).toISOString() }],
  ['u-2', { code: 'LOY-U2-9920', expiresAt: new Date(now + 30 * 86_400_000).toISOString() }],
  ['u-3', { code: 'LOY-U3-4471', expiresAt: new Date(now + 30 * 86_400_000).toISOString() }],
])

function resolveLoyaltyRules(input?: LoyaltyRulesInput): ResolvedLoyaltyRules {
  const pointToCurrency =
    typeof input?.pointToCurrency === 'number' && input.pointToCurrency > 0
      ? input.pointToCurrency
      : DEFAULT_POINT_TO_CURRENCY
  const earnRatePerCurrency =
    typeof input?.earnRatePerCurrency === 'number' && input.earnRatePerCurrency >= 0
      ? input.earnRatePerCurrency
      : DEFAULT_EARN_RATE_PER_CURRENCY
  const tierThresholds = {
    gold:
      typeof input?.tierThresholds?.gold === 'number' && input.tierThresholds.gold >= 0
        ? input.tierThresholds.gold
        : DEFAULT_TIER_THRESHOLDS.gold,
    loyal:
      typeof input?.tierThresholds?.loyal === 'number' && input.tierThresholds.loyal >= 0
        ? input.tierThresholds.loyal
        : DEFAULT_TIER_THRESHOLDS.loyal,
  }
  if (tierThresholds.loyal < tierThresholds.gold) {
    tierThresholds.loyal = tierThresholds.gold
  }
  const inputTiers = (input?.tiers ?? [])
    .filter((tier) => tier.id.trim().length > 0 && tier.name.trim().length > 0 && tier.minPoints >= 0)
    .map((tier) => ({
      id: tier.id.trim().toLowerCase(),
      name: tier.name.trim(),
      minPoints: Math.floor(tier.minPoints),
    }))
    .sort((a, b) => a.minPoints - b.minPoints)

  const tiers =
    inputTiers.length > 0
      ? inputTiers
      : [
          { id: 'silver', name: 'Silver', minPoints: 0 },
          { id: 'gold', name: 'Gold', minPoints: tierThresholds.gold },
          { id: 'loyal', name: 'Loyal', minPoints: tierThresholds.loyal },
        ]

  const validOptions = (input?.redeemOptions ?? [])
    .filter((option) => option.percent > 0 && option.percent <= 100 && option.pointsCost > 0)
    .sort((a, b) => a.percent - b.percent)

  return {
    pointToCurrency,
    earnRatePerCurrency,
    tiers,
    tierThresholds,
    redeemOptions: validOptions.length > 0 ? validOptions : DEFAULT_REDEEM_OPTIONS,
  }
}

function getTierForPoints(points: number, rules: ResolvedLoyaltyRules) {
  let current = rules.tiers[0]
  for (const tier of rules.tiers) {
    if (points >= tier.minPoints) {
      current = tier
      continue
    }
    break
  }
  return current?.name ?? 'Silver'
}

function buildTierProgress(points: number, rules: ResolvedLoyaltyRules) {
  const orderedTiers = rules.tiers
  const fallbackTier = orderedTiers[0] ?? { id: 'silver', name: 'Silver', minPoints: 0 }

  let currentTier = fallbackTier
  let nextTier: LoyaltyTierRule | null = null
  for (const tier of orderedTiers) {
    if (points >= tier.minPoints) {
      currentTier = tier
      continue
    }
    nextTier = tier
    break
  }

  const currentTierFloor = currentTier.minPoints
  const nextTierThreshold = nextTier?.minPoints ?? null
  const pointsToNextTier = nextTier ? Math.max(0, nextTier.minPoints - points) : 0
  const progressPercent = nextTier
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(((points - currentTierFloor) / Math.max(1, nextTier.minPoints - currentTierFloor)) * 100)
        )
      )
    : 100

  return {
    currentTierId: currentTier.id,
    currentTierName: currentTier.name,
    nextTierId: nextTier?.id ?? null,
    nextTierName: nextTier?.name ?? null,
    currentPoints: points,
    nextTierThreshold,
    pointsToNextTier,
    progressPercent,
  }
}

function ensureLoyaltyState(userId: string, role: AuthRole): LoyaltyState | null {
  if (role === 'admin') {
    return null
  }
  const existing = loyaltyStateByUserId.get(userId)
  if (existing) {
    return existing
  }
  const seeded: LoyaltyState = {
    points: 0,
    tier: 'Silver',
    currency: 'USD',
    expiringSoonPoints: 0,
    expiringSoonAt: null,
  }
  loyaltyStateByUserId.set(userId, seeded)
  return seeded
}

function buildLoyaltyWallet(userId: string, role: AuthRole, rulesInput?: LoyaltyRulesInput): LoyaltyWallet | null {
  const state = ensureLoyaltyState(userId, role)
  if (!state) {
    return null
  }
  const rules = resolveLoyaltyRules(rulesInput)

  const tierProgress = buildTierProgress(state.points, rules)
  const redeemableValue = Math.round(state.points * rules.pointToCurrency * 100) / 100
  let barcode = barcodeByUserId.get(userId)
  if (!barcode) {
    barcode = {
      code: `LOY-${userId}-${Math.floor(Math.random() * 9000 + 1000)}`,
      expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    }
    barcodeByUserId.set(userId, barcode)
  }

  return {
    tier: tierProgress.currentTierName,
    points: state.points,
    redeemableValue,
    currency: state.currency,
    expiringSoonPoints: state.expiringSoonPoints,
    expiringSoonAt: state.expiringSoonAt,
    redeemOptions: rules.redeemOptions.filter((option) => option.pointsCost <= state.points),
    barcode,
    tierProgress,
  }
}

export const mockAccountAdapter: AccountProvider = {
  async getOverview(user, loyaltyRules) {
    const overview: AccountOverview = {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      loyaltySummary: buildLoyaltyWallet(user.userId, user.role, loyaltyRules),
      lastOrder: {
        id: 'ord-u-1-seed-1',
        ownerUserId: 'u-1',
        status: 'placed',
        total: 68,
        currency: 'USD',
        createdAt: new Date(now - 2 * 86_400_000).toISOString(),
      },
    }
    return { ok: true, data: overview }
  },

  async listAddresses(userId) {
    return { ok: true, data: addressesByUserId.get(userId) ?? [] }
  },

  async getLoyaltyWallet(userId, role, loyaltyRules) {
    return { ok: true, data: buildLoyaltyWallet(userId, role, loyaltyRules) }
  },

  async listLoyaltyHistory(userId) {
    return { ok: true, data: loyaltyHistoryByUserId.get(userId) ?? [] }
  },

  async applyOrderLoyalty(userId, role, input) {
    const rules = resolveLoyaltyRules(input.loyaltyRules)
    const state = ensureLoyaltyState(userId, role)
    if (!state) {
      return {
        ok: true,
        data: {
          discountValue: 0,
          pointsSpent: 0,
          pointsEarned: 0,
          updatedWallet: null,
          historyEntryIds: [],
        },
      }
    }

    const subtotal = Math.max(0, input.subtotal)
    const selectedOption =
      typeof input.redeemPercent === 'number'
        ? rules.redeemOptions.find((option) => option.percent === input.redeemPercent)
        : null

    if (input.redeemPercent !== undefined && !selectedOption) {
      return {
        ok: false,
        error: {
          code: 'LOYALTY_REDEEM_OPTION_INVALID',
          message: 'Selected loyalty redeem option is invalid.',
        },
      }
    }

    const history = loyaltyHistoryByUserId.get(userId) ?? []
    const historyEntryIds: string[] = []
    let pointsSpent = 0
    let discountValue = 0

    if (selectedOption) {
      if (state.points < selectedOption.pointsCost) {
        return {
          ok: false,
          error: {
            code: 'LOYALTY_POINTS_INSUFFICIENT',
            message: 'Not enough points for the selected redeem option.',
          },
        }
      }

      pointsSpent = selectedOption.pointsCost
      const discountByPercent = (subtotal * selectedOption.percent) / 100
      const maxDiscountByPoints = pointsSpent * rules.pointToCurrency
      discountValue = Math.min(discountByPercent, maxDiscountByPoints, subtotal)
      discountValue = Math.round(discountValue * 100) / 100
      state.points -= pointsSpent

      const redeemHistoryId = `lh-${userId}-${Date.now()}-redeem`
      history.unshift({
        id: redeemHistoryId,
        title: `Redeemed ${selectedOption.percent}% at checkout`,
        pointsDelta: -pointsSpent,
        createdAt: new Date().toISOString(),
      })
      historyEntryIds.push(redeemHistoryId)
    }

    const pointsEarned = Math.max(0, Math.floor((subtotal - discountValue) * rules.earnRatePerCurrency))
    if (pointsEarned > 0) {
      state.points += pointsEarned
      const earnHistoryId = `lh-${userId}-${Date.now()}-earn`
      history.unshift({
        id: earnHistoryId,
        title: 'Order purchase',
        pointsDelta: pointsEarned,
        createdAt: new Date().toISOString(),
      })
      historyEntryIds.push(earnHistoryId)
    }

    state.tier = getTierForPoints(state.points, rules)
    loyaltyStateByUserId.set(userId, state)
    loyaltyHistoryByUserId.set(userId, history)

    return {
      ok: true,
      data: {
        discountValue,
        pointsSpent,
        pointsEarned,
        updatedWallet: buildLoyaltyWallet(userId, role, input.loyaltyRules),
        historyEntryIds,
      },
    }
  },

  async listWishlist(userId) {
    return { ok: true, data: wishlistByUserId.get(userId) ?? [] }
  },

  async listTests(userId) {
    return { ok: true, data: testsByUserId.get(userId) ?? [] }
  },

  async getTest(userId, testId) {
    const test = (testDetailsByUserId.get(userId) ?? []).find((item) => item.id === testId)
    if (!test) {
      return {
        ok: false,
        error: {
          code: 'ACCOUNT_TEST_NOT_FOUND',
          message: 'Test record was not found.',
        },
      }
    }
    return { ok: true, data: test }
  },

  async createAddress(userId, input) {
    const label = input.label.trim()
    const city = input.city.trim()
    const area = input.area.trim()
    const building = input.building.trim()
    if (!label || !city || !area || !building) {
      return {
        ok: false,
        error: {
          code: 'ACCOUNT_ADDRESS_INVALID',
          message: 'Label, city, area, and building are required.',
        },
      }
    }

    const current = addressesByUserId.get(userId) ?? []
    const next = [
      ...current,
      {
        id: `addr-${userId}-${Date.now()}`,
        label,
        city,
        area,
        building,
        floor: input.floor?.trim() || undefined,
        apartment: input.apartment?.trim() || undefined,
        isDefault: current.length === 0,
      },
    ]
    addressesByUserId.set(userId, next)
    return { ok: true, data: next }
  },

  async updateAddress(userId, addressId, input) {
    const current = addressesByUserId.get(userId) ?? []
    const exists = current.some((item) => item.id === addressId)
    if (!exists) {
      return {
        ok: false,
        error: {
          code: 'ACCOUNT_ADDRESS_NOT_FOUND',
          message: 'Address was not found.',
        },
      }
    }
    const next = current.map((item) => {
      if (item.id !== addressId) return item
      return {
        ...item,
        label: input.label?.trim() ?? item.label,
        city: input.city?.trim() ?? item.city,
        area: input.area?.trim() ?? item.area,
        building: input.building?.trim() ?? item.building,
        floor: input.floor?.trim() || undefined,
        apartment: input.apartment?.trim() || undefined,
      }
    })
    addressesByUserId.set(userId, next)
    return { ok: true, data: next }
  },

  async deleteAddress(userId, addressId) {
    const current = addressesByUserId.get(userId) ?? []
    const exists = current.some((item) => item.id === addressId)
    if (!exists) {
      return {
        ok: false,
        error: {
          code: 'ACCOUNT_ADDRESS_NOT_FOUND',
          message: 'Address was not found.',
        },
      }
    }
    const next = current.filter((item) => item.id !== addressId)
    if (next.length > 0 && !next.some((item) => item.isDefault)) {
      const first = next[0]
      if (first) {
        next[0] = {
          ...first,
          isDefault: true,
        }
      }
    }
    addressesByUserId.set(userId, next)
    return { ok: true, data: next }
  },

  async setDefaultAddress(userId, addressId) {
    const current = addressesByUserId.get(userId) ?? []
    const exists = current.some((item) => item.id === addressId)
    if (!exists) {
      return {
        ok: false,
        error: {
          code: 'ACCOUNT_ADDRESS_NOT_FOUND',
          message: 'Address was not found.',
        },
      }
    }
    const next = current.map((item) => ({
      ...item,
      isDefault: item.id === addressId,
    }))
    addressesByUserId.set(userId, next)
    return { ok: true, data: next }
  },

  async getQr(userId) {
    const current = qrByUserId.get(userId)
    if (current) {
      return { ok: true, data: { qrCode: current } }
    }
    const generated = `RC-${userId.toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`
    qrByUserId.set(userId, generated)
    return { ok: true, data: { qrCode: generated } }
  },
}
