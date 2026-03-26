import { productQueryProvider, releaseProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { parseHomeBlock } from '@real/app/lib/cms/blocks'
import { getBlockQueryReference, validateBlockQueryReference } from '@real/app/lib/cms/query-references'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../_lib/admin-controls-store'
import { syncReleaseBlocksToPageDraft } from '../../_lib/page-config-store'
import { resolveStoreId } from '../../_lib/release-env'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) return session

    const releaseId = new URL(request.url).searchParams.get('releaseId')?.trim()
    if (!releaseId) return fail('ADMIN_RELEASE_ID_REQUIRED', 'releaseId is required.', 400)

    const result = await releaseProvider.listBlocks(releaseId)
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    const pageDraft = await syncReleaseBlocksToPageDraft({
      storeId: resolveStoreId(request),
      releaseId,
      blocks: result.data,
    })
    return ok(pageDraft.blocks)
  } catch (cause) {
    return fail('ADMIN_RELEASE_BLOCKS_LIST_UNEXPECTED', 'Unexpected error while loading release blocks.', 500, {
      scope: 'GET /api/admin/release-blocks',
      cause,
    })
  }
}

type BlockType =
  | 'hero'
  | 'product_slider'
  | 'brand_promo'
  | 'promo_strip'
  | 'category_shortcuts'
  | 'offer_stack'
  | 'sticky_listing_promo'
  | 'hero_carousel'
  | 'flash_sale'
  | 'brand_spotlight'
  | 'offer_banners'
  | 'education_banner'
  | 'newsletter_cta'
  | 'top_brands'
  | 'ugc_gallery'
  | 'personalized_rail'
  | 'pdp_offer_cluster'
  | 'cart_upsell_rail'

type CreatePayload = {
  releaseId?: string
  position?: number
  type?: BlockType
  payloadJson?: unknown
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as CreatePayload
    if (!body.releaseId) return fail('ADMIN_RELEASE_ID_REQUIRED', 'releaseId is required.', 400)
    if (!body.type) return fail('ADMIN_RELEASE_BLOCK_TYPE_REQUIRED', 'Block type is required.', 400)
    if (typeof body.position !== 'number' || body.position < 1) {
      return fail('ADMIN_RELEASE_BLOCK_POSITION_INVALID', 'Block position must be >= 1.', 400)
    }

    const parsed = parseHomeBlock(body.payloadJson)
    if (!parsed) return fail('ADMIN_RELEASE_BLOCK_INVALID', 'Block payload does not match schema.', 400)
    if (parsed.type !== body.type) {
      return fail('ADMIN_RELEASE_BLOCK_TYPE_MISMATCH', 'Block payload type does not match request type.', 400)
    }
    const queryIssues = validateBlockQueryReference(parsed, [], {
      blockType: body.type,
    })
    const requiredIssue = queryIssues.find((issue) => issue.code === 'BLOCK_QUERY_REQUIRED')
    if (requiredIssue) return fail('ADMIN_RELEASE_QUERY_REQUIRED', requiredIssue.message, 400)

    const querySlug = getBlockQueryReference(parsed)?.querySlug?.trim() ?? ''
    if (querySlug) {
      const query = await productQueryProvider.getBySlug(querySlug)
      if (!query.ok || !query.data.active) {
        return fail('ADMIN_RELEASE_QUERY_INVALID', 'querySlug references missing/inactive query.', 400)
      }
    }

    const created = await releaseProvider.createBlock({
      releaseId: body.releaseId,
      position: body.position,
      type: body.type,
      payloadJson: body.payloadJson,
    })
    if (!created.ok) return fail(created.error.code, created.error.message, 400)

    const releaseBlocks = await releaseProvider.listBlocks(body.releaseId)
    if (!releaseBlocks.ok) {
      return fail(releaseBlocks.error.code, releaseBlocks.error.message, 400)
    }
    await syncReleaseBlocksToPageDraft({
      storeId: resolveStoreId(request),
      releaseId: body.releaseId,
      blocks: releaseBlocks.data,
    })

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: created.data.id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.block.create', releaseId: body.releaseId },
    })
    await writeAdminControlsState(state)

    return ok(created.data, 201)
  } catch (cause) {
    return fail('ADMIN_RELEASE_BLOCK_CREATE_UNEXPECTED', 'Unexpected error while creating release block.', 500, {
      scope: 'POST /api/admin/release-blocks',
      cause,
    })
  }
}

