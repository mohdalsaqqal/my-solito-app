import { cmsProvider, productProvider, productQueryProvider, releaseProvider } from '@real/providers'
import { parseHomeBlock, localizeString } from '@real/app/lib/cms/blocks'
import { createHomePagePayload } from '@real/app/lib/layout/page-schema'
import type { CMSHomeBlock, CMSHomeHeroCarouselCard, CMSHomeOfferBannerItem } from '@real/app/lib/types'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { resolveReleaseEnvironment, resolveStoreId } from '../../../app/api/_lib/release-env'
import { applyAdminControlsToCms, readAdminControlsState } from '../cms/cms-admin-controls.service'
import { resolveRequestLocale } from '../../../app/api/_lib/request-locale'
import { readSiteConfig } from '../cms/cms-site-config.service'
import { readBannersState } from '../cms/cms-banners.service'
import { readUGCState } from '../cms/cms-ugc.service'
import { readHomeMerchandising, applyMerchandisingToCms } from '../cms/cms-home-merchandising.service'
import { resolvePreviewContext, getPreviewRelease, loadPreviewBlocks } from '../cms/cms-preview.service'
import { attachResolvedShellMenus } from '../navigation/resolve-shell-menus.service'
import {
  findLatestPageVersionByRelease,
  toReleaseBlockRecords,
} from '../../../app/api/_lib/page-version-store'

function dropLog(reason: string, details: Record<string, unknown>) {
  console.warn('[cms-home:block-dropped]', reason, details)
}

export async function getHomeCmsResponseData(request: Request) {
  const [cmsResult, state, siteConfig, bannersState, ugcState] = await Promise.all([
    cmsProvider.getHome(),
    readAdminControlsState(),
    readSiteConfig().catch(() => null),
    readBannersState().catch(() => null),
    readUGCState().catch(() => null),
  ])

  if (!cmsResult.ok) {
    throw new Error(`[cms-home] ${cmsResult.error.code}: ${cmsResult.error.message}`)
  }

  const cms = applyAdminControlsToCms(cmsResult.data, state)
  const locale = resolveRequestLocale(request)
  const environment = resolveReleaseEnvironment(request)
  const storeId = resolveStoreId(request)
  const previewContext = resolvePreviewContext(request.url)

  // Apply canonical Prisma merchandising (or fall back to mock if Prisma is unreachable)
  const merchandisingResult = await readHomeMerchandising()
  const cmsWithMerchandising = applyMerchandisingToCms(cms, merchandisingResult)

  let effectiveReleaseId: string | null = null

  if (previewContext.valid) {
    const previewRelease = await getPreviewRelease(previewContext)
    if (previewRelease) {
      effectiveReleaseId = previewRelease.id
    }
  }

  if (!effectiveReleaseId) {
    const publishedRelease = await releaseProvider.getPublished(environment === 'production' ? 'production' : 'staging')
    if (!publishedRelease.ok && environment !== 'production') {
      const fallbackProduction = await releaseProvider.getPublished('production')
      if (fallbackProduction.ok) {
        effectiveReleaseId = fallbackProduction.data.id
      }
    } else if (publishedRelease.ok) {
      effectiveReleaseId = publishedRelease.data.id
    }
  }

  const enrichProducts = async (querySlug: string) => {
    const queryResult = await productQueryProvider.getBySlug(querySlug)
    if (!queryResult.ok || !queryResult.data.active) return null
    const productsResult = await productProvider.list(queryResult.data.filters)
    if (!productsResult.ok || productsResult.data.length === 0) return null
    return productsResult.data.map((product) => {
      const resolved = passThroughPricingService.getProductPrice(product)
      return { ...product, price: resolved.unitPrice, currency: resolved.currency }
    })
  }

  const enrichProductsByIds = async (productIds: string[]) => {
    if (productIds.length === 0) return []
    const productsResult = await productProvider.list({ ids: productIds, limit: productIds.length })
    if (!productsResult.ok || productsResult.data.length === 0) return []
    const productsById = new Map(
      productsResult.data.map((product) => {
        const resolved = passThroughPricingService.getProductPrice(product)
        return [product.id, { ...product, price: resolved.unitPrice, currency: resolved.currency }] as const
      }),
    )
    return productIds.map((id) => productsById.get(id)).filter((product): product is NonNullable<typeof product> => Boolean(product))
  }

  type EnrichedProduct = NonNullable<Awaited<ReturnType<typeof enrichProducts>>>[number]

  const localizeHeroCarouselCards = (
    cards: NonNullable<Extract<ReturnType<typeof parseHomeBlock>, { type: 'hero_carousel' }>['cards']>,
    blockLocale: typeof locale,
  ): CMSHomeHeroCarouselCard[] => {
    return cards.map((card) => ({
      ...card,
      titleText: blockLocale === 'ar' ? card.titleAr : card.titleEn,
      subtitleText: blockLocale === 'ar' ? card.subtitleAr : card.subtitleEn,
      ctaText: blockLocale === 'ar' ? card.ctaLabelAr : card.ctaLabelEn,
      badgeText: blockLocale === 'ar' ? card.badgeLabelAr : card.badgeLabelEn,
    }))
  }

  const localizeOfferBannerItems = (
    items: NonNullable<Extract<ReturnType<typeof parseHomeBlock>, { type: 'offer_banners' }>['items']>,
    blockLocale: typeof locale,
  ): CMSHomeOfferBannerItem[] => {
    return items.map((item) => ({
      ...item,
      ctaText: blockLocale === 'ar' ? item.ctaLabelAr : item.ctaLabelEn,
    }))
  }

  const safeBlocks: CMSHomeBlock[] = []

  const loadReleaseBlocksForHome = async (releaseId: string) => {
    // Try preview blocks first
    if (previewContext.valid) {
      const previewBlocks = await loadPreviewBlocks(previewContext, storeId)
      if (previewBlocks) return previewBlocks
    }

    // Fall back to page version store
    const version = await findLatestPageVersionByRelease({
      releaseId,
      storeId,
    })
    if (version) {
      return toReleaseBlockRecords(version)
    }

    // Fall back to release provider
    const blocksResult = await releaseProvider.listBlocks(releaseId)
    if (!blocksResult.ok) return null
    return blocksResult.data
  }

  // ── Two-pass block processing: collect queries → parallelize → assemble ──

  if (effectiveReleaseId) {
    const releaseBlocks = await loadReleaseBlocksForHome(effectiveReleaseId)
    if (releaseBlocks) {
      // Parse all blocks first (no I/O)
      type ParsedBlock = {
        blockRecord: NonNullable<Awaited<ReturnType<typeof loadReleaseBlocksForHome>>>[number]
        parsed: NonNullable<ReturnType<typeof parseHomeBlock>>
      }
      const parsedBlocks: ParsedBlock[] = []
      for (const blockRecord of releaseBlocks) {
        if (blockRecord.enabled === false) continue
        const parsed = parseHomeBlock(blockRecord.payloadJson)
        if (!parsed) {
          dropLog('SCHEMA_INVALID', {
            blockId: blockRecord.id,
            releaseId: blockRecord.releaseId,
            blockType: blockRecord.type,
          })
          continue
        }
        parsedBlocks.push({ blockRecord, parsed })
      }

      // Collect all query slugs and product ID arrays
      const querySlugs = new Set<string>()
      const productIdSets: { blockIndex: number; productIds: string[] }[] = []
      for (let i = 0; i < parsedBlocks.length; i++) {
        const { parsed } = parsedBlocks[i]
        if ((parsed.type === 'product_slider' || parsed.type === 'brand_promo' || parsed.type === 'personalized_rail' || parsed.type === 'brand_spotlight') && parsed.querySlug) {
          querySlugs.add(parsed.querySlug)
        }
        if (parsed.type === 'editorial_hotspot' && parsed.productIds.length > 0) {
          productIdSets.push({ blockIndex: i, productIds: parsed.productIds })
        }
      }

      // Parallelize all product enrichments
      const querySlugsArray = Array.from(querySlugs)
      const [queryResults, idResults] = await Promise.allSettled([
        Promise.all(querySlugsArray.map(slug => enrichProducts(slug))),
        Promise.all(productIdSets.map(({ productIds }) => enrichProductsByIds(productIds))),
      ])

      // Log if enrichment pipeline failed entirely
      if (queryResults.status === 'rejected') {
        console.error('[cms-home] Query enrichment pipeline failed:', queryResults.reason)
      }
      if (idResults.status === 'rejected') {
        console.error('[cms-home] Product ID enrichment pipeline failed:', idResults.reason)
      }

      const queryMap = new Map<string, NonNullable<Awaited<ReturnType<typeof enrichProducts>>>>()
      if (queryResults.status === 'fulfilled') {
        for (let qi = 0; qi < querySlugsArray.length; qi++) {
          const result = queryResults.value[qi]
          if (result) queryMap.set(querySlugsArray[qi], result)
        }
      }

      const idResultMap = new Map<number, EnrichedProduct[]>()
      if (idResults.status === 'fulfilled') {
        for (let i = 0; i < productIdSets.length; i++) {
          const result = idResults.value[i]
          if (result && result.length > 0) {
            idResultMap.set(productIdSets[i].blockIndex, result)
          }
        }
      }

      // Second pass: assemble blocks with pre-fetched products
      for (let idx = 0; idx < parsedBlocks.length; idx++) {
        const { blockRecord, parsed } = parsedBlocks[idx]

        if (parsed.type === 'product_slider' || (parsed.type === 'brand_promo' && parsed.querySlug)) {
          const querySlug = parsed.querySlug
          if (!querySlug) {
            dropLog('QUERY_SLUG_MISSING', { blockId: blockRecord.id })
            continue
          }
          const products = queryMap.get(querySlug)
          if (!products) {
            dropLog('QUERY_INVALID_OR_EMPTY', { blockId: blockRecord.id, querySlug })
            continue
          }
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: 'title' in parsed ? localizeString((parsed as { title?: { en: string; ar: string } }).title, locale) : undefined,
            subtitleText:
              'subtitle' in parsed
                ? localizeString((parsed as { subtitle?: { en: string; ar: string } }).subtitle, locale)
                : undefined,
            ctaText:
              'ctaLabel' in parsed
                ? localizeString((parsed as { ctaLabel?: { en: string; ar: string } }).ctaLabel, locale)
                : undefined,
            products,
          })
          continue
        }

        if (parsed.type === 'brand_spotlight') {
          const products = parsed.querySlug ? queryMap.get(parsed.querySlug) ?? [] : []
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: locale === 'ar' ? parsed.bannerTitleAr : parsed.bannerTitleEn,
            products,
          })
          continue
        }

        if (parsed.type === 'personalized_rail') {
          const products = parsed.mode === 'static' && parsed.querySlug
            ? queryMap.get(parsed.querySlug) ?? []
            : []
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: locale === 'ar' ? parsed.titleAr : parsed.titleEn,
            products,
          })
          continue
        }

        if (parsed.type === 'ugc_gallery') {
          const ugcItems =
            ugcState && ugcState.items.length > 0
              ? ugcState.items
                  .filter((item) => item.active)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => ({
                    id: item.id,
                    imageUrl: item.imageUrl,
                    caption: { en: item.caption, ar: item.caption },
                  }))
              : []
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: locale === 'ar' ? (parsed.titleAr ?? '') : (parsed.titleEn ?? ''),
            items: ugcItems,
          })
          continue
        }

        if (parsed.type === 'hero_carousel') {
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            cardsLocalized: localizeHeroCarouselCards(parsed.cards, locale),
          })
          continue
        }

        if (parsed.type === 'flash_sale') {
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: locale === 'ar' ? parsed.titleAr : parsed.titleEn,
            ctaText: locale === 'ar' ? (parsed.ctaLabelAr ?? '') : (parsed.ctaLabelEn ?? ''),
          })
          continue
        }

        if (parsed.type === 'offer_banners') {
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            itemsLocalized: localizeOfferBannerItems(parsed.items, locale),
          })
          continue
        }

        if (parsed.type === 'editorial_hotspot') {
          const products = idResultMap.get(idx) ?? []
          if (products.length === 0) {
            // Render with empty products instead of hard-dropping — UI shows placeholder
            console.warn('[cms-home:editorial_hotspot] No products found for block', {
              blockId: blockRecord.id,
              productIds: parsed.productIds,
            })
          }
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: parsed.title ? localizeString(parsed.title, locale) : undefined,
            subtitleText: parsed.subtitle ? localizeString(parsed.subtitle, locale) : undefined,
            ctaText: parsed.ctaLabel ? localizeString(parsed.ctaLabel, locale) : undefined,
            products,
            hotspots: (parsed.hotspots ?? []).map((hotspot) => ({
              ...hotspot,
              label: hotspot.label,
            })),
          })
          continue
        }

        if (parsed.type === 'education_banner') {
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: locale === 'ar' ? parsed.titleAr : parsed.titleEn,
            ctaText: locale === 'ar' ? (parsed.ctaLabelAr ?? '') : (parsed.ctaLabelEn ?? ''),
          })
          continue
        }

        if (parsed.type === 'newsletter_cta') {
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: locale === 'ar' ? parsed.titleAr : parsed.titleEn,
            ctaText: locale === 'ar' ? (parsed.ctaLabelAr ?? '') : (parsed.ctaLabelEn ?? ''),
          })
          continue
        }

        if (parsed.type === 'top_brands') {
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            titleText: locale === 'ar' ? (parsed.titleAr ?? '') : (parsed.titleEn ?? ''),
          })
          continue
        }

        safeBlocks.push({
          ...parsed,
          position: blockRecord.position,
          releaseId: blockRecord.releaseId,
          locale,
          titleText:
            'title' in parsed
              ? localizeString((parsed as { title?: { en: string; ar: string } }).title, locale)
              : undefined,
          subtitleText:
            'subtitle' in parsed
              ? localizeString((parsed as { subtitle?: { en: string; ar: string } }).subtitle, locale)
              : undefined,
          ctaText:
            'ctaLabel' in parsed
              ? localizeString((parsed as { ctaLabel?: { en: string; ar: string } }).ctaLabel, locale)
              : undefined,
          textValue:
            'text' in parsed ? localizeString((parsed as { text?: { en: string; ar: string } }).text, locale) : undefined,
        })
      }
    }
  }

  safeBlocks.sort((left, right) => left.position - right.position)

  if (siteConfig) {
    const localeBranding = locale === 'ar' ? siteConfig.branding.ar : siteConfig.branding.en
    const fallbackBranding = cmsWithMerchandising.shell?.branding
    const fallbackAlt = fallbackBranding?.logo.alt ?? { en: 'Real Cosmetics', ar: 'رِيال كوزمتيكس' }
    const fallbackUri = fallbackBranding?.logo.uri ?? '/brand-logo-placeholder.svg'

    cmsWithMerchandising.shell = cmsWithMerchandising.shell ?? {}
    cmsWithMerchandising.shell.branding = {
      logo: {
        uri: localeBranding.logoUrl || fallbackUri,
        alt: {
          en: siteConfig.branding.en.logoAlt || fallbackAlt.en,
          ar: siteConfig.branding.ar.logoAlt || fallbackAlt.ar,
        },
      },
      logoSize: localeBranding.logoSize ?? fallbackBranding?.logoSize ?? 'md',
    }
  }

  if (siteConfig && cmsWithMerchandising.shell?.topBar) {
    if (siteConfig.topBar.messageEn) {
      cmsWithMerchandising.shell.topBar.message = {
        ...cmsWithMerchandising.shell.topBar.message,
        en: siteConfig.topBar.messageEn,
      }
    }
    if (siteConfig.topBar.messageAr) {
      cmsWithMerchandising.shell.topBar.message = {
        ...cmsWithMerchandising.shell.topBar.message,
        ar: siteConfig.topBar.messageAr,
      }
    }
    if (siteConfig.topBar.ctaLabelEn || siteConfig.topBar.ctaLabelAr) {
      cmsWithMerchandising.shell.topBar.ctaLabel = {
        en: siteConfig.topBar.ctaLabelEn || (cmsWithMerchandising.shell.topBar.ctaLabel?.en ?? ''),
        ar: siteConfig.topBar.ctaLabelAr || (cmsWithMerchandising.shell.topBar.ctaLabel?.ar ?? ''),
      }
    }
    if (siteConfig.topBar.ctaHref) {
      cmsWithMerchandising.shell.topBar.ctaHref = siteConfig.topBar.ctaHref
    }
  }

  if (siteConfig && cmsWithMerchandising.shell?.footer) {
    if (siteConfig.footer.newsletterTitleEn || siteConfig.footer.newsletterTitleAr) {
      cmsWithMerchandising.shell.footer.newsletterTitle = {
        en: siteConfig.footer.newsletterTitleEn || (cmsWithMerchandising.shell.footer.newsletterTitle?.en ?? ''),
        ar: siteConfig.footer.newsletterTitleAr || (cmsWithMerchandising.shell.footer.newsletterTitle?.ar ?? ''),
      }
    }
    if (siteConfig.footer.legalEn || siteConfig.footer.legalAr) {
      cmsWithMerchandising.shell.footer.legalNotice = {
        en: siteConfig.footer.legalEn || (cmsWithMerchandising.shell.footer.legalNotice?.en ?? ''),
        ar: siteConfig.footer.legalAr || (cmsWithMerchandising.shell.footer.legalNotice?.ar ?? ''),
      }
    }
  }

  if (siteConfig && cmsWithMerchandising.shell?.search?.panelTitles) {
    if (siteConfig.search.panelTitleEn || siteConfig.search.panelTitleAr) {
      cmsWithMerchandising.shell.search.panelTitles.trendingSearches = {
        en: siteConfig.search.panelTitleEn || (cmsWithMerchandising.shell.search.panelTitles.trendingSearches?.en ?? ''),
        ar: siteConfig.search.panelTitleAr || (cmsWithMerchandising.shell.search.panelTitles.trendingSearches?.ar ?? ''),
      }
    }
  }

  if (bannersState && cmsWithMerchandising.marketing?.ticker) {
    const activeTickerItems = bannersState.ticker.items.filter((item) => item.active)
    if (activeTickerItems.length > 0) {
      cmsWithMerchandising.marketing.ticker.items = activeTickerItems.map((item) => ({
        id: item.id,
        message: { en: item.messageEn, ar: item.messageAr },
      }))
    }
    if (bannersState.ticker.speedMs > 0) {
      cmsWithMerchandising.marketing.ticker.speedMs = bannersState.ticker.speedMs
    }
  }

  if (bannersState) {
    const activeEducationBanners = bannersState.educationBanners.filter((b) => b.active)
    if (activeEducationBanners.length > 0) {
      ;(cmsWithMerchandising.marketing as Record<string, unknown>).educationBanners = activeEducationBanners.map((b) => ({
        id: b.id,
        title: { en: b.titleEn, ar: b.titleAr },
        body: { en: b.bodyEn, ar: b.bodyAr },
        targetPage: b.targetPage,
      }))
    }
  }

  if (ugcState && cmsWithMerchandising.marketing?.ugcGallery) {
    const activeUgcItems = ugcState.items
      .filter((item) => item.active)
      .sort((a, b) => a.order - b.order)
    if (activeUgcItems.length > 0) {
      cmsWithMerchandising.marketing.ugcGallery.items = activeUgcItems.map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        caption: { en: item.caption, ar: item.caption },
      }))
    }
  }

  await attachResolvedShellMenus(cms, locale)

  const page = createHomePagePayload(
    storeId,
    safeBlocks.map((block) => ({
      id: block.id,
      type: block.type,
      position: block.position,
      props: block,
    })),
  )

  return {
    payload: {
      ...cmsWithMerchandising,
      storeId,
      page,
      marketing: {
        ...(cmsWithMerchandising.marketing ?? {}),
        homeBlocks: safeBlocks,
      },
    },
    preview: previewContext,
  }
}

// ---------------------------------------------------------------------------
// Cached entry point — used by SSR pages to avoid re-computing on every hit.
// Preview requests bypass the cache entirely.
// ---------------------------------------------------------------------------

const HOME_CACHE_TTL_MS = 3 * 60 * 1000 // 3 minutes

export async function getCachedHomeCmsResponseData(requestUrl: string) {
  const url = new URL(requestUrl)
  const previewContext = resolvePreviewContext(requestUrl)
  const request = new Request(requestUrl)

  if (previewContext.valid) {
    return getHomeCmsResponseData(request)
  }

  return getHomeCmsResponseData(request)
}
