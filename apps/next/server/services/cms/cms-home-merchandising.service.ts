/**
 * CMS Home Merchandising — canonical read service for homepage marketing content.
 *
 * Reads all homepage merchandising content from Prisma:
 * - Marketing rails
 * - Campaigns (zones)
 * - Hero carousel cards
 * - Editorial hotspots
 * - Newsletter CTA
 * - Personalization settings
 * - Rail autoplay settings
 * - Featured slot
 * - Complete set
 *
 * Returns `{ ok, data }` so callers can distinguish "Prisma returned empty"
 * from "Prisma was unreachable". When Prisma is unreachable, the caller
 * should fall back to mock/seed data.
 */
import type { CMSHome } from '@real/app/lib/types'
import { prisma } from '../../lib/prisma'

// ── Service ────────────────────────────────────────────────────────────────────

export type HomeMerchandising = {
  rails: Array<{
    id: string
    enabled: boolean
    title: { en: string; ar: string }
    query: { source: string; limit: number; sortBy: string }
  }>
  campaigns: Array<{
    id: string
    enabled: boolean
    zone: string
    title: { en: string; ar: string }
    subtitle: { en: string; ar: string }
    ctaLabel: { en: string; ar: string }
    href: string
    imageUrl: string
    timerEndsAt: string
    urgencyBadge: { en: string; ar: string }
    showTimer: boolean
    showUrgency: boolean
  }>
  heroCards: Array<{
    id: string
    title: string
    subtitle: string
    ctaLabel: string
    href: string
    imageUrl: string
    badgeLabel: { en: string; ar: string }
  }>
  editorialHotspot: {
    enabled: boolean
    title: { en: string; ar: string }
    subtitle: { en: string; ar: string }
    ctaLabel: { en: string; ar: string }
    href: string
    imageUrl: string
    productIds: string[]
  } | null
  newsletterCta: {
    enabled: boolean
    title: { en: string; ar: string }
    subtitle: { en: string; ar: string }
    ctaLabel: { en: string; ar: string }
    href: string
  } | null
  personalization: {
    enabled: boolean
    mode: string
    recommendedTitle: { en: string; ar: string }
  } | null
  railAutoplay: Record<string, { enabled: boolean; autoplayMs: number }>
  featuredSlot: {
    enabled: boolean
    title: { en: string; ar: string }
    subtitle: { en: string; ar: string }
    ctaLabel: { en: string; ar: string }
    href: string
    imageUrl: string
  } | null
  completeSet: {
    enabled: boolean
    title: { en: string; ar: string }
    subtitle: { en: string; ar: string }
    ctaLabel: { en: string; ar: string }
    ctaHref: string
    query: { source: string; limit: number; sortBy: string }
  } | null
}

export type HomeMerchandisingResult =
  | { ok: true; data: HomeMerchandising; source: 'prisma' }
  | { ok: false; error: string }

async function safePrisma<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await fn() }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV === 'production') {
      console.error('[cms-home-merchandising] Prisma query failed:', message)
    }
    return { ok: false, error: message }
  }
}

function unwrapPrismaResult<T>(result: { ok: true; data: T } | { ok: false; error: string }): T {
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}

async function readRails(): Promise<HomeMerchandising['rails']> {
  try {
    const rails = await prisma.cmsMarketingRail.findMany({
      where: { enabled: true },
      orderBy: { position: 'asc' },
    })
    return rails.map((r) => ({
      id: r.railId,
      enabled: r.enabled,
      title: { en: r.titleEn, ar: r.titleAr },
      query: { source: r.querySource, limit: r.queryLimit, sortBy: r.querySortBy },
    }))
  } catch {
    return []
  }
}

async function readCampaigns(): Promise<HomeMerchandising['campaigns']> {
  try {
    const campaigns = await prisma.cmsCampaign.findMany({
      where: { enabled: true },
      orderBy: { position: 'asc' },
    })
    return campaigns.map((c) => ({
      id: c.campaignId,
      enabled: c.enabled,
      zone: c.zone,
      title: { en: c.titleEn, ar: c.titleAr },
      subtitle: { en: c.subtitleEn, ar: c.subtitleAr },
      ctaLabel: { en: c.ctaLabelEn, ar: c.ctaLabelAr },
      href: c.href,
      imageUrl: c.imageUrl,
      timerEndsAt: c.timerEndsAt,
      urgencyBadge: { en: c.urgencyBadgeEn, ar: c.urgencyBadgeAr },
      showTimer: c.showTimer,
      showUrgency: c.showUrgency,
    }))
  } catch {
    return []
  }
}

async function readHeroCards(): Promise<HomeMerchandising['heroCards']> {
  try {
    const cards = await prisma.cmsHeroCard.findMany({
      orderBy: { position: 'asc' },
    })
    return cards.map((c) => ({
      id: c.cardId,
      title: c.titleEn,
      subtitle: c.subtitleEn,
      ctaLabel: c.ctaLabelEn,
      href: c.href,
      imageUrl: c.imageUrl,
      badgeLabel: { en: c.badgeLabelEn, ar: c.badgeLabelAr },
    }))
  } catch {
    return []
  }
}

async function readEditorialHotspot(): Promise<HomeMerchandising['editorialHotspot']> {
  try {
    const hotspot = await prisma.cmsEditorialHotspot.findFirst({
      where: { enabled: true },
    })
    if (!hotspot) return null
    const productIds = (hotspot.productIdsJson as string[]) ?? []
    return {
      enabled: hotspot.enabled,
      title: { en: hotspot.titleEn, ar: hotspot.titleAr },
      subtitle: { en: hotspot.subtitleEn, ar: hotspot.subtitleAr },
      ctaLabel: { en: hotspot.ctaLabelEn, ar: hotspot.ctaLabelAr },
      href: hotspot.href,
      imageUrl: hotspot.imageUrl,
      productIds,
    }
  } catch {
    return null
  }
}

async function readNewsletterCta(): Promise<HomeMerchandising['newsletterCta']> {
  try {
    const cta = await prisma.cmsNewsletterCta.findFirst({
      where: { enabled: true },
    })
    if (!cta) return null
    return {
      enabled: cta.enabled,
      title: { en: cta.titleEn, ar: cta.titleAr },
      subtitle: { en: cta.subtitleEn, ar: cta.subtitleAr },
      ctaLabel: { en: cta.ctaLabelEn, ar: cta.ctaLabelAr },
      href: cta.href,
    }
  } catch {
    return null
  }
}

async function readPersonalization(): Promise<HomeMerchandising['personalization']> {
  try {
    const p = await prisma.cmsPersonalization.findFirst({
      where: { enabled: true },
    })
    if (!p) return null
    return {
      enabled: p.enabled,
      mode: p.mode,
      recommendedTitle: { en: p.recommendedTitleEn, ar: p.recommendedTitleAr },
    }
  } catch {
    return null
  }
}

async function readRailAutoplay(): Promise<HomeMerchandising['railAutoplay']> {
  try {
    const settings = await prisma.cmsRailAutoplay.findMany()
    const result: Record<string, { enabled: boolean; autoplayMs: number }> = {}
    for (const s of settings) {
      result[s.railKey] = { enabled: s.enabled, autoplayMs: s.autoplayMs }
    }
    return result
  } catch {
    return {}
  }
}

async function readFeaturedSlot(): Promise<HomeMerchandising['featuredSlot']> {
  try {
    const slot = await prisma.cmsFeaturedSlot.findFirst({
      where: { enabled: true },
    })
    if (!slot) return null
    return {
      enabled: slot.enabled,
      title: { en: slot.titleEn, ar: slot.titleAr },
      subtitle: { en: slot.subtitleEn, ar: slot.subtitleAr },
      ctaLabel: { en: slot.ctaLabelEn, ar: slot.ctaLabelAr },
      href: slot.href,
      imageUrl: slot.imageUrl,
    }
  } catch {
    return null
  }
}

async function readCompleteSet(): Promise<HomeMerchandising['completeSet']> {
  try {
    const cs = await prisma.cmsCompleteSet.findFirst({
      where: { enabled: true },
    })
    if (!cs) return null
    return {
      enabled: cs.enabled,
      title: { en: cs.titleEn, ar: cs.titleAr },
      subtitle: { en: cs.subtitleEn, ar: cs.subtitleAr },
      ctaLabel: { en: cs.ctaLabelEn, ar: cs.ctaLabelAr },
      ctaHref: cs.ctaHref,
      query: { source: cs.querySource, limit: cs.queryLimit, sortBy: cs.querySortBy },
    }
  } catch {
    return null
  }
}

export async function readHomeMerchandising(): Promise<HomeMerchandisingResult> {
  // Quick Prisma connectivity check
  const probe = await safePrisma(() => prisma.cmsMarketingRail.count())
  if (!probe.ok) {
    return { ok: false, error: `Prisma unreachable: ${probe.error}` }
  }

  const [
    railsResult,
    campaignsResult,
    heroCardsResult,
    editorialHotspotResult,
    newsletterCtaResult,
    personalizationResult,
    railAutoplayResult,
    featuredSlotResult,
    completeSetResult,
  ] = await Promise.all([
    safePrisma(() => prisma.cmsMarketingRail.findMany({ where: { enabled: true }, orderBy: { position: 'asc' } })),
    safePrisma(() => prisma.cmsCampaign.findMany({ where: { enabled: true }, orderBy: { position: 'asc' } })),
    safePrisma(() => prisma.cmsHeroCard.findMany({ orderBy: { position: 'asc' } })),
    safePrisma(() => prisma.cmsEditorialHotspot.findFirst({ where: { enabled: true } })),
    safePrisma(() => prisma.cmsNewsletterCta.findFirst({ where: { enabled: true } })),
    safePrisma(() => prisma.cmsPersonalization.findFirst({ where: { enabled: true } })),
    safePrisma(() => prisma.cmsRailAutoplay.findMany()),
    safePrisma(() => prisma.cmsFeaturedSlot.findFirst({ where: { enabled: true } })),
    safePrisma(() => prisma.cmsCompleteSet.findFirst({ where: { enabled: true } })),
  ])

  const failures = [
    ['rails', railsResult],
    ['campaigns', campaignsResult],
    ['heroCards', heroCardsResult],
    ['editorialHotspot', editorialHotspotResult],
    ['newsletterCta', newsletterCtaResult],
    ['personalization', personalizationResult],
    ['railAutoplay', railAutoplayResult],
    ['featuredSlot', featuredSlotResult],
    ['completeSet', completeSetResult],
  ] satisfies Array<[string, { ok: true; data: unknown } | { ok: false; error: string }]>

  const failureMessages = failures
    .flatMap(([name, result]) => (result.ok ? [] : [`${name}: ${result.error}`]))

  if (failureMessages.length > 0) {
    return {
      ok: false,
      error: `Partial Prisma merchandising failure: ${failureMessages.join('; ')}`,
    }
  }

  const rails = unwrapPrismaResult(railsResult).map((r) => ({
    id: r.railId,
    enabled: r.enabled,
    title: { en: r.titleEn, ar: r.titleAr },
    query: { source: r.querySource, limit: r.queryLimit, sortBy: r.querySortBy },
  }))

  const campaigns = unwrapPrismaResult(campaignsResult).map((c) => ({
    id: c.campaignId,
    enabled: c.enabled,
    zone: c.zone,
    title: { en: c.titleEn, ar: c.titleAr },
    subtitle: { en: c.subtitleEn, ar: c.subtitleAr },
    ctaLabel: { en: c.ctaLabelEn, ar: c.ctaLabelAr },
    href: c.href,
    imageUrl: c.imageUrl,
    timerEndsAt: c.timerEndsAt,
    urgencyBadge: { en: c.urgencyBadgeEn, ar: c.urgencyBadgeAr },
    showTimer: c.showTimer,
    showUrgency: c.showUrgency,
  }))

  const heroCards = unwrapPrismaResult(heroCardsResult).map((c) => ({
    id: c.cardId,
    title: c.titleEn,
    subtitle: c.subtitleEn,
    ctaLabel: c.ctaLabelEn,
    href: c.href,
    imageUrl: c.imageUrl,
    badgeLabel: { en: c.badgeLabelEn, ar: c.badgeLabelAr },
  }))

  const editorialHotspotRecord = unwrapPrismaResult(editorialHotspotResult)
  const editorialHotspot = editorialHotspotRecord
    ? {
        enabled: editorialHotspotRecord.enabled,
        title: { en: editorialHotspotRecord.titleEn, ar: editorialHotspotRecord.titleAr },
        subtitle: { en: editorialHotspotRecord.subtitleEn, ar: editorialHotspotRecord.subtitleAr },
        ctaLabel: { en: editorialHotspotRecord.ctaLabelEn, ar: editorialHotspotRecord.ctaLabelAr },
        href: editorialHotspotRecord.href,
        imageUrl: editorialHotspotRecord.imageUrl,
        productIds: ((editorialHotspotRecord.productIdsJson as string[]) ?? []),
      }
    : null

  const newsletterCtaRecord = unwrapPrismaResult(newsletterCtaResult)
  const newsletterCta = newsletterCtaRecord
    ? {
        enabled: newsletterCtaRecord.enabled,
        title: { en: newsletterCtaRecord.titleEn, ar: newsletterCtaRecord.titleAr },
        subtitle: { en: newsletterCtaRecord.subtitleEn, ar: newsletterCtaRecord.subtitleAr },
        ctaLabel: { en: newsletterCtaRecord.ctaLabelEn, ar: newsletterCtaRecord.ctaLabelAr },
        href: newsletterCtaRecord.href,
      }
    : null

  const personalizationRecord = unwrapPrismaResult(personalizationResult)
  const personalization = personalizationRecord
    ? {
        enabled: personalizationRecord.enabled,
        mode: personalizationRecord.mode,
        recommendedTitle: { en: personalizationRecord.recommendedTitleEn, ar: personalizationRecord.recommendedTitleAr },
      }
    : null

  const railAutoplay: Record<string, { enabled: boolean; autoplayMs: number }> = Object.fromEntries(
    unwrapPrismaResult(railAutoplayResult).map((s) => [s.railKey, { enabled: s.enabled, autoplayMs: s.autoplayMs }]),
  )

  const featuredSlotRecord = unwrapPrismaResult(featuredSlotResult)
  const featuredSlotData = featuredSlotRecord
    ? {
        enabled: featuredSlotRecord.enabled,
        title: { en: featuredSlotRecord.titleEn, ar: featuredSlotRecord.titleAr },
        subtitle: { en: featuredSlotRecord.subtitleEn, ar: featuredSlotRecord.subtitleAr },
        ctaLabel: { en: featuredSlotRecord.ctaLabelEn, ar: featuredSlotRecord.ctaLabelAr },
        href: featuredSlotRecord.href,
        imageUrl: featuredSlotRecord.imageUrl,
      }
    : null

  const completeSetRecord = unwrapPrismaResult(completeSetResult)
  const completeSetData = completeSetRecord
    ? {
        enabled: completeSetRecord.enabled,
        title: { en: completeSetRecord.titleEn, ar: completeSetRecord.titleAr },
        subtitle: { en: completeSetRecord.subtitleEn, ar: completeSetRecord.subtitleAr },
        ctaLabel: { en: completeSetRecord.ctaLabelEn, ar: completeSetRecord.ctaLabelAr },
        ctaHref: completeSetRecord.ctaHref,
        query: { source: completeSetRecord.querySource, limit: completeSetRecord.queryLimit, sortBy: completeSetRecord.querySortBy },
      }
    : null

  return {
    ok: true,
    source: 'prisma',
    data: {
      rails,
      campaigns,
      heroCards,
      editorialHotspot: editorialHotspot,
      newsletterCta,
      personalization,
      railAutoplay,
      featuredSlot: featuredSlotData,
      completeSet: completeSetData,
    },
  }
}

/**
 * Applies canonical Prisma merchandising to a CMS home payload.
 *
 * When Prisma is the source (`result.ok === true`), it COMPLETELY REPLACES
 * mock merchandising data — empty Prisma results are intentional, not fallback.
 * When Prisma is unreachable (`result.ok === false`), mock data is preserved.
 */
export function applyMerchandisingToCms(
  home: CMSHome,
  result: HomeMerchandisingResult,
): CMSHome {
  // Prisma unreachable → keep mock data as-is (fallback mode)
  if (!result.ok) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[cms-home-merchandising] Falling back to mock data:', result.error)
    }
    return home
  }

  // Prisma is canonical source → replace mock merchandising entirely
  const m = result.data
  const next = structuredClone(home)
  if (!next.marketing) {
    next.marketing = {} as NonNullable<CMSHome['marketing']>
  }

  const mkt = next.marketing as Record<string, unknown>

  // Rails — replace
  mkt.rails = m.rails

  // Campaigns — replace
  mkt.campaigns = m.campaigns

  // Hero cards — replace
  if (!mkt.hero) {
    mkt.hero = {}
  }
  ;(mkt.hero as Record<string, unknown>).cards = m.heroCards

  // Editorial hotspot — replace
  mkt.editorialHotspotSection = m.editorialHotspot

  // Newsletter CTA — replace
  mkt.newsletterCta = m.newsletterCta

  // Personalization — replace
  mkt.personalization = m.personalization

  // Rail autoplay — replace
  mkt.railAutoplay = m.railAutoplay

  // Featured slot — replace
  mkt.featuredSlot = m.featuredSlot

  // Complete set — replace
  mkt.completeSet = m.completeSet

  return next as CMSHome
}
