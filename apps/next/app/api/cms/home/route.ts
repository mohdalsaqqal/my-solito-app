import { cmsProvider, productProvider, productQueryProvider, releaseProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { parseHomeBlock, localizeString } from '@real/app/lib/cms/blocks'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { resolveReleaseEnvironment } from '../../_lib/release-env'
import { verifyPreviewToken } from '../../_lib/preview-token'
import { applyAdminControlsToCms, readAdminControlsState } from '../../_lib/admin-controls-store'
import { resolveRequestLocale } from '../../_lib/request-locale'

function dropLog(reason: string, details: Record<string, unknown>) {
  console.warn('[cms-home:block-dropped]', reason, details)
}

export async function GET(request: Request) {
  try {
    const [cmsResult, state] = await Promise.all([cmsProvider.getHome(), readAdminControlsState()])
    if (!cmsResult.ok) {
      return fail(cmsResult.error.code, cmsResult.error.message, 500)
    }

    const cms = applyAdminControlsToCms(cmsResult.data, state)
    const locale = resolveRequestLocale(request)
    const environment = resolveReleaseEnvironment(request)
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

    const safeBlocks: Array<Record<string, unknown>> = []

    if (effectiveReleaseId) {
      const blocksResult = await releaseProvider.listBlocks(effectiveReleaseId)
      if (blocksResult.ok) {
        for (const blockRecord of blocksResult.data) {
          const parsed = parseHomeBlock(blockRecord.payloadJson)
          if (!parsed) {
            dropLog('SCHEMA_INVALID', {
              blockId: blockRecord.id,
              releaseId: blockRecord.releaseId,
              blockType: blockRecord.type,
            })
            continue
          }

          if (parsed.type === 'product_slider' || (parsed.type === 'brand_promo' && parsed.querySlug)) {
            const querySlug = parsed.type === 'product_slider' ? parsed.querySlug : parsed.querySlug
            if (!querySlug) {
              dropLog('QUERY_SLUG_MISSING', { blockId: blockRecord.id })
              continue
            }

            const queryResult = await productQueryProvider.getBySlug(querySlug)
            if (!queryResult.ok || !queryResult.data.active) {
              dropLog('QUERY_INVALID', {
                blockId: blockRecord.id,
                querySlug,
              })
              continue
            }

            const productsResult = await productProvider.list(queryResult.data.filters)
            if (!productsResult.ok || productsResult.data.length === 0) {
              dropLog('PRODUCTS_EMPTY', {
                blockId: blockRecord.id,
                querySlug,
              })
              continue
            }

            const products = productsResult.data.map((product) => {
              const resolved = passThroughPricingService.getProductPrice(product)
              return {
                ...product,
                price: resolved.unitPrice,
                currency: resolved.currency,
              }
            })

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

    const responsePayload = {
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
