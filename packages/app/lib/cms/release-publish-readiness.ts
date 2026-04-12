import { AdminReleaseBlockRecord } from '../types'
import { parseHomeBlock } from './blocks'
import { validateBlockQueryReference } from './query-references'

export type ReleasePublishIssueCode =
  | 'RELEASE_EMPTY'
  | 'BLOCK_INVALID_PAYLOAD'
  | 'BLOCK_QUERY_REQUIRED'
  | 'BLOCK_QUERY_INACTIVE'
  | 'BLOCK_FIELD_REQUIRED'

export type ReleasePublishIssue = {
  code: ReleasePublishIssueCode
  blockId?: string
  blockType?: AdminReleaseBlockRecord['type']
  field?: string
  message: string
}

export type ReleasePublishReadiness = {
  ok: boolean
  issues: ReleasePublishIssue[]
}

type ValidateReleaseReadinessInput = {
  blocks: AdminReleaseBlockRecord[]
  activeQuerySlugs?: Iterable<string>
}

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0
}

function pushRequiredFieldIssue(
  issues: ReleasePublishIssue[],
  blockId: string,
  blockType: AdminReleaseBlockRecord['type'],
  field: string,
  label: string
) {
  issues.push({
    code: 'BLOCK_FIELD_REQUIRED',
    blockId,
    blockType,
    field,
    message: `Block ${blockId} is missing ${label}.`,
  })
}

export function validateReleasePublishReadiness({
  blocks,
  activeQuerySlugs,
}: ValidateReleaseReadinessInput): ReleasePublishReadiness {
  const issues: ReleasePublishIssue[] = []
  const activeQueries = new Set(activeQuerySlugs ?? [])

  if (blocks.length === 0) {
    issues.push({
      code: 'RELEASE_EMPTY',
      message: 'Add at least one block before publishing.',
    })
    return { ok: false, issues }
  }

  for (const block of blocks) {
    // Disabled blocks are excluded from publish validation
    if (block.enabled === false) continue

    const parsed = parseHomeBlock(block.payloadJson)
    if (!parsed) {
      issues.push({
        code: 'BLOCK_INVALID_PAYLOAD',
        blockId: block.id,
        blockType: block.type,
        message: `Block ${block.id} payload is invalid.`,
      })
      continue
    }

    if (parsed.type === 'hero') {
      if (isBlank(parsed.title.en)) pushRequiredFieldIssue(issues, block.id, block.type, 'title.en', 'English title')
      if (isBlank(parsed.title.ar)) pushRequiredFieldIssue(issues, block.id, block.type, 'title.ar', 'Arabic title')
    }

    if (parsed.type === 'promo_strip') {
      if (isBlank(parsed.text.en)) pushRequiredFieldIssue(issues, block.id, block.type, 'text.en', 'English text')
      if (isBlank(parsed.text.ar)) pushRequiredFieldIssue(issues, block.id, block.type, 'text.ar', 'Arabic text')
    }

    if (parsed.type === 'product_slider') {
      if (isBlank(parsed.title.en)) pushRequiredFieldIssue(issues, block.id, block.type, 'title.en', 'English title')
      if (isBlank(parsed.title.ar)) pushRequiredFieldIssue(issues, block.id, block.type, 'title.ar', 'Arabic title')
    }

    if (parsed.type === 'hero_carousel') {
      if (parsed.cards.length === 0) pushRequiredFieldIssue(issues, block.id, block.type, 'cards', 'at least one card')
    }

    if (parsed.type === 'flash_sale') {
      if (isBlank(parsed.titleEn)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleEn', 'English title')
      if (isBlank(parsed.titleAr)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleAr', 'Arabic title')
      if (isBlank(parsed.timerEndsAt)) pushRequiredFieldIssue(issues, block.id, block.type, 'timerEndsAt', 'end date')
    }

    if (parsed.type === 'brand_spotlight') {
      if (isBlank(parsed.bannerTitleEn) && isBlank(parsed.bannerTitleAr)) pushRequiredFieldIssue(issues, block.id, block.type, 'bannerTitle', 'banner title')
    }

    if (parsed.type === 'education_banner') {
      if (isBlank(parsed.titleEn)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleEn', 'English title')
      if (isBlank(parsed.titleAr)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleAr', 'Arabic title')
    }

    if (parsed.type === 'newsletter_cta') {
      if (isBlank(parsed.titleEn)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleEn', 'English title')
      if (isBlank(parsed.titleAr)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleAr', 'Arabic title')
    }

    if (parsed.type === 'personalized_rail') {
      if (isBlank(parsed.titleEn)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleEn', 'English title')
      if (isBlank(parsed.titleAr)) pushRequiredFieldIssue(issues, block.id, block.type, 'titleAr', 'Arabic title')
    }

    if (parsed.type === 'editorial_hotspot') {
      if (isBlank(parsed.imageUrl)) pushRequiredFieldIssue(issues, block.id, block.type, 'imageUrl', 'image')
      if (parsed.productIds.length === 0) pushRequiredFieldIssue(issues, block.id, block.type, 'productIds', 'at least one product')
    }

    if (parsed.type === 'brand_deal_banner') {
      if (parsed.items.length === 0) pushRequiredFieldIssue(issues, block.id, block.type, 'items', 'at least one item')
    }

    const queryIssues = validateBlockQueryReference(parsed, activeQueries, {
      blockId: block.id,
      blockType: block.type,
    })
    issues.push(
      ...queryIssues.map((issue) => ({
        ...issue,
        blockId: block.id,
        blockType: block.type,
      })),
    )
  }

  return { ok: issues.length === 0, issues }
}
