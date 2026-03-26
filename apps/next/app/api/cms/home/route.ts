import { cmsProvider, productProvider, productQueryProvider, releaseProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { parseHomeBlock, localizeString } from '@real/app/lib/cms/blocks'
import { createHomePagePayload } from '@real/app/lib/layout/page-schema'
import type { CMSHomeBlock, CMSHomeHeroCarouselCard, CMSHomeOfferBannerItem } from '@real/app/lib/types'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { resolveReleaseEnvironment, resolveStoreId } from '../../_lib/release-env'
import { verifyPreviewToken } from '../../_lib/preview-token'
import { applyAdminControlsToCms, readAdminControlsState } from '../../_lib/admin-controls-store'
import { resolveRequestLocale } from '../../_lib/request-locale'
import { readSiteConfig } from '../../_lib/admin-site-config-store'
import { readBannersState } from '../../_lib/admin-banners-store'
import { readUGCState } from '../../_lib/admin-ugc-store'

function dropLog(reason: string, details: Record<string, unknown>) {
  console.warn('[cms-home:block-dropped]', reason, details)
}

export async function GET(request: Request) {
  try {
    const [cmsResult, state, siteConfig, bannersState, ugcState] = await Promise.all([
      cmsProvider.getHome(),
      readAdminControlsState(),
      readSiteConfig().catch(() => null),
      readBannersState().catch(() => null),
      readUGCState().catch(() => null),
    ])
    if (!cmsResult.ok) {
      return fail(cmsResult.error.code, cmsResult.error.message, 500)
    }

    const cms = applyAdminControlsToCms(cmsResult.data, state)
    const locale = resolveRequestLocale(request)
    const environment = resolveReleaseEnvironment(request)
    const storeId = resolveStoreId(request)
    const preview = verifyPreviewToken(new URL(request.url).searchParams.get('previewToken'))

    let effectiveReleaseId: string | null = null

    if (preview.valid) {
      const previewRelease = await releaseProvider.getById(preview.releaseId)
      if (previewRelease.ok) {
        effectiveReleaseId = previewRelease.data.id
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

    // Helper: fetch and price products for a querySlug — used inside the block loop below
    async function enrichProducts(querySlug: string) {
      const queryResult = await productQueryProvider.getBySlug(querySlug)
      if (!queryResult.ok || !queryResult.data.active) return null
      const productsResult = await productProvider.list(queryResult.data.filters)
      if (!productsResult.ok || productsResult.data.length === 0) return null
      return productsResult.data.map((product) => {
        const resolved = passThroughPricingService.getProductPrice(product)
        return { ...product, price: resolved.unitPrice, currency: resolved.currency }
      })
    }

    async function enrichProductsByIds(productIds: string[]) {
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

    type EnrichedProduct = Awaited<ReturnType<typeof enrichProducts>> extends Array<infer T> ? T : never

    function localizeHeroCarouselCards(cards: NonNullable<Extract<ReturnType<typeof parseHomeBlock>, { type: 'hero_carousel' }>['cards']>, blockLocale: typeof locale): CMSHomeHeroCarouselCard[] {
      return cards.map((card) => ({
        ...card,
        titleText: blockLocale === 'ar' ? card.titleAr : card.titleEn,
        subtitleText: blockLocale === 'ar' ? card.subtitleAr : card.subtitleEn,
        ctaText: blockLocale === 'ar' ? card.ctaLabelAr : card.ctaLabelEn,
        badgeText: blockLocale === 'ar' ? card.badgeLabelAr : card.badgeLabelEn,
      }))
    }

    function localizeOfferBannerItems(items: NonNullable<Extract<ReturnType<typeof parseHomeBlock>, { type: 'offer_banners' }>['items']>, blockLocale: typeof locale): CMSHomeOfferBannerItem[] {
      return items.map((item) => ({
        ...item,
        ctaText: blockLocale === 'ar' ? item.ctaLabelAr : item.ctaLabelEn,
      }))
    }

    const safeBlocks: CMSHomeBlock[] = []

    if (effectiveReleaseId) {
      const blocksResult = await releaseProvider.listBlocks(effectiveReleaseId)
      if (blocksResult.ok) {
        for (const blockRecord of blocksResult.data) {
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

          // Blocks that require product enrichment via querySlug
          if (parsed.type === 'product_slider' || (parsed.type === 'brand_promo' && parsed.querySlug)) {
            const querySlug = parsed.querySlug
            if (!querySlug) {
              dropLog('QUERY_SLUG_MISSING', { blockId: blockRecord.id })
              continue
            }
            const products = await enrichProducts(querySlug)
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

          // brand_spotlight: enrich with products when querySlug present (non-fatal if absent)
          if (parsed.type === 'brand_spotlight') {
            let products: EnrichedProduct[] = []
            if (parsed.querySlug) {
              const enriched = await enrichProducts(parsed.querySlug)
              if (enriched) products = enriched
            }
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

          // personalized_rail: enrich with products when mode=static and querySlug present
          if (parsed.type === 'personalized_rail') {
            let products: EnrichedProduct[] = []
            if (parsed.mode === 'static' && parsed.querySlug) {
              const enriched = await enrichProducts(parsed.querySlug)
              if (enriched) products = enriched
            }
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

          // ugc_gallery: merge in live ugcState items
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

          // hero_carousel: localize each card title/subtitle/cta
          if (parsed.type === 'hero_carousel') {
            safeBlocks.push({
              ...parsed,
              position: blockRecord.position,
              releaseId: blockRecord.releaseId,
              locale,
            })
            continue
          }

          // flash_sale: pass through with localized titleText
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

          // offer_banners: pass through
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
            const products = await enrichProductsByIds(parsed.productIds)
            if (products.length === 0) {
              dropLog('PRODUCTS_EMPTY', {
                blockId: blockRecord.id,
                productIds: parsed.productIds,
              })
              continue
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

          // education_banner: pass through with localized titleText
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

          // newsletter_cta: pass through with localized titleText
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

          // top_brands: pass through with optional localized title
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

          // Existing simple blocks (hero, promo_strip)
          safeBlocks.push({
            ...parsed,
            position: blockRecord.position,
            releaseId: blockRecord.releaseId,
            locale,
            ...(parsed.type === 'hero_carousel' ? { cardsLocalized: localizeHeroCarouselCards(parsed.cards, locale) } : {}),
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

    // --- Merge persisted admin CMS configs over mock defaults ---

    // 1. shell.branding — locale-aware logo URL/alt/size
    if (siteConfig) {
      const localeBranding = locale === 'ar' ? siteConfig.branding.ar : siteConfig.branding.en
      const fallbackBranding = cms.shell?.branding
      const fallbackAlt = fallbackBranding?.logo.alt ?? { en: 'Real Cosmetics', ar: 'ريال كوزمتكس' }
      const fallbackUri = fallbackBranding?.logo.uri ?? '/brand-logo-placeholder.svg'

      cms.shell = cms.shell ?? {}
      cms.shell.branding = {
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

    // 2. shell.topBar — site config message EN/AR and CTA
    if (siteConfig && cms.shell?.topBar) {
      if (siteConfig.topBar.messageEn) {
        cms.shell.topBar.message = {
          ...cms.shell.topBar.message,
          en: siteConfig.topBar.messageEn,
        }
      }
      if (siteConfig.topBar.messageAr) {
        cms.shell.topBar.message = {
          ...cms.shell.topBar.message,
          ar: siteConfig.topBar.messageAr,
        }
      }
      if (siteConfig.topBar.ctaLabelEn || siteConfig.topBar.ctaLabelAr) {
        cms.shell.topBar.ctaLabel = {
          en: siteConfig.topBar.ctaLabelEn || (cms.shell.topBar.ctaLabel?.en ?? ''),
          ar: siteConfig.topBar.ctaLabelAr || (cms.shell.topBar.ctaLabel?.ar ?? ''),
        }
      }
      if (siteConfig.topBar.ctaHref) {
        cms.shell.topBar.ctaHref = siteConfig.topBar.ctaHref
      }
    }

    // 3. shell.footer — newsletter title and legal notice
    if (siteConfig && cms.shell?.footer) {
      if (siteConfig.footer.newsletterTitleEn || siteConfig.footer.newsletterTitleAr) {
        cms.shell.footer.newsletterTitle = {
          en: siteConfig.footer.newsletterTitleEn || (cms.shell.footer.newsletterTitle?.en ?? ''),
          ar: siteConfig.footer.newsletterTitleAr || (cms.shell.footer.newsletterTitle?.ar ?? ''),
        }
      }
      if (siteConfig.footer.legalEn || siteConfig.footer.legalAr) {
        cms.shell.footer.legalNotice = {
          en: siteConfig.footer.legalEn || (cms.shell.footer.legalNotice?.en ?? ''),
          ar: siteConfig.footer.legalAr || (cms.shell.footer.legalNotice?.ar ?? ''),
        }
      }
    }

    // 4. shell.search — panel titles
    if (siteConfig && cms.shell?.search?.panelTitles) {
      if (siteConfig.search.panelTitleEn || siteConfig.search.panelTitleAr) {
        cms.shell.search.panelTitles.trendingSearches = {
          en: siteConfig.search.panelTitleEn || (cms.shell.search.panelTitles.trendingSearches?.en ?? ''),
          ar: siteConfig.search.panelTitleAr || (cms.shell.search.panelTitles.trendingSearches?.ar ?? ''),
        }
      }
    }

    // 5. ticker — active items only, merge speedMs
    if (bannersState && cms.marketing?.ticker) {
      const activeTickerItems = bannersState.ticker.items.filter((item) => item.active)
      if (activeTickerItems.length > 0) {
        cms.marketing.ticker.items = activeTickerItems.map((item) => ({
          id: item.id,
          message: { en: item.messageEn, ar: item.messageAr },
        }))
      }
      if (bannersState.ticker.speedMs > 0) {
        cms.marketing.ticker.speedMs = bannersState.ticker.speedMs
      }
    }

    // 6. educationBanners — active items only, appended to marketing
    if (bannersState) {
      const activeEducationBanners = bannersState.educationBanners.filter((b) => b.active)
      if (activeEducationBanners.length > 0) {
        ;(cms.marketing as Record<string, unknown>).educationBanners = activeEducationBanners.map((b) => ({
          id: b.id,
          title: { en: b.titleEn, ar: b.titleAr },
          body: { en: b.bodyEn, ar: b.bodyAr },
          targetPage: b.targetPage,
        }))
      }
    }

    // 7. ugcGallery — active items only, sorted by order ascending
    if (ugcState && cms.marketing?.ugcGallery) {
      const activeUgcItems = ugcState.items
        .filter((item) => item.active)
        .sort((a, b) => a.order - b.order)
      if (activeUgcItems.length > 0) {
        cms.marketing.ugcGallery.items = activeUgcItems.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          caption: { en: item.caption, ar: item.caption },
        }))
      }
    }

    // --- End admin CMS merge ---

    const page = createHomePagePayload(
      storeId,
      safeBlocks.map((block) => ({
        id: block.id,
        type: block.type,
        position: block.position,
        props: block,
      }))
    )

    const responsePayload = {
      storeId,
      page,
      ...cms,
      marketing: {
        ...(cms.marketing ?? {}),
        homeBlocks: safeBlocks,
      },
    }

    const response = ok(responsePayload)
    if (preview.valid) {
      response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    }

    return response
  } catch (cause) {
    return fail(
      'CMS_HOME_UNEXPECTED',
      'Unexpected error while fetching home CMS data.',
      500,
      { scope: 'GET /api/cms/home', cause }
    )
  }
}
