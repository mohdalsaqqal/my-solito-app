import { test } from 'node:test'
import assert from 'node:assert/strict'
import { auth } from '../../../lib/auth'
import { prisma } from '../../../server/lib/prisma'
import { getAccountPageInitialData } from './account-page.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

const testContext: StorefrontServiceContext = {
  requestUrl: 'http://internal.local/api/cms/home',
  locale: 'en',
  storeId: 'default',
  tenantId: 'default',
}

async function seedReferralProfile() {
  await prisma.referralProgram.upsert({
    where: { tenantId_storeId: { tenantId: 'default', storeId: 'default' } },
    create: {
      storeId: 'default',
      mode: 'influencers_only',
      accessMode: 'link_and_code',
      followerRewardType: 'percentage_discount',
      followerRewardValue: 10,
      influencerRewardType: 'commission_percentage',
      influencerRewardValue: 12,
      attributionWindowDays: 30,
      firstOrderOnly: true,
      allowStackingWithPromotions: false,
      minimumOrderAmount: 25,
    },
    update: {},
  })

  // Upsert: force the expected code even if a profile was auto-created
  const existing = await prisma.referralProfile.findFirst({ where: { userId: 'u-1' } })
  if (existing) {
    await prisma.referralProfile.update({
      where: { id: existing.id },
      data: { code: 'GLOWWITHU1', shareLink: 'https://realcosmetics.local/r/GLOWWITHU1', approved: true },
    })
  } else {
    await prisma.referralProfile.create({
      data: {
        id: 'ref-prof-u-1',
        storeId: 'default',
        userId: 'u-1',
        userEmail: 'user@realcosmetics.local',
        actorType: 'influencer',
        code: 'GLOWWITHU1',
        shareLink: 'https://realcosmetics.local/r/GLOWWITHU1',
        approved: true,
        displayName: 'Customer User',
        audienceCount: 18200,
      },
    })
  }
}

test('account-page - happy path returns expected shape', async () => {
  await seedReferralProfile()

  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: {
      id: 'u-1',
      email: 'user@realcosmetics.local',
      name: 'Customer User',
      emailVerified: true,
    },
    session: {
      id: 'session-u-1',
    },
  })) as typeof auth.api.getSession

  try {
    const result = await getAccountPageInitialData(testContext)

    assert.equal(result.session?.userId, 'u-1')
    assert.equal(result.overview?.user.email, 'user@realcosmetics.local')
    assert.ok(result.loyaltyWallet, 'loyalty wallet should be loaded')
    assert.ok(result.loyaltyHistory.length > 0, 'loyalty history should be loaded')
    assert.ok(result.tests.some((item) => item.template.type === 'skin'), 'skin tests should be visible')
    assert.ok(result.tests.some((item) => item.template.type === 'hair'), 'hair tests should be visible')
    assert.equal(result.referralSummary?.code, 'GLOWWITHU1')
    assert.ok(result.accountQr?.qrCode, 'account QR should be loaded')
  } finally {
    auth.api.getSession = original
  }
})

test('account-page - failure path handles missing session', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null) as typeof auth.api.getSession

  try {
    const result = await getAccountPageInitialData(testContext)
    assert.equal(result.session, null)
    assert.equal(result.loyaltyWallet, null)
    assert.equal(result.referralSummary, null)
    assert.deepEqual(result.tests, [])
  } finally {
    auth.api.getSession = original
  }
})
