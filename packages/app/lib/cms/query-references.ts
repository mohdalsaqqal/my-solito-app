import { ReleaseBlockRecord, ReleaseBlockType, ReleaseEnvironment, ReleaseRecord, ReleaseStatus } from '@real/providers/contracts'
import { HomeBlock, parseHomeBlock } from './blocks'
import type { ProductQueryResolverInput } from '@real/providers/contracts'
import type { QueryBoundBlockType } from '../layout/page-types'

export type BlockQueryValidationIssueCode = 'BLOCK_QUERY_REQUIRED' | 'BLOCK_QUERY_INACTIVE'

export type BlockQueryValidationIssue = {
  code: BlockQueryValidationIssueCode
  field: 'querySlug'
  message: string
}

export type BlockQueryReference = {
  blockType: ReleaseBlockType
  querySlug?: string
  required: boolean
}

export type QueryUsageRecord = {
  querySlug: string
  releaseId: string
  releaseEnvironment: ReleaseEnvironment
  releaseStatus: ReleaseStatus
  blockId: string
  blockType: ReleaseBlockType
  position: number
  enabled: boolean
}

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0
}

export function getBlockQueryReference(block: HomeBlock): BlockQueryReference | null {
  switch (block.type) {
    case 'product_slider':
      return { blockType: block.type, querySlug: block.querySlug, required: true }
    case 'brand_promo':
      return { blockType: block.type, querySlug: block.querySlug, required: false }
    case 'brand_spotlight':
      return { blockType: block.type, querySlug: block.querySlug, required: false }
    case 'personalized_rail':
      return {
        blockType: block.type,
        querySlug: block.querySlug,
        required: block.mode === 'static',
      }
    case 'cart_upsell_rail':
      return { blockType: block.type, querySlug: block.querySlug, required: true }
    default:
      return null
  }
}

export function getProductQueryResolverInput(
  block: HomeBlock,
  context: { storeId: string; blockId?: string },
): ProductQueryResolverInput | null {
  const reference = getBlockQueryReference(block)
  const querySlug = reference?.querySlug?.trim()

  if (!reference || !querySlug) return null

  // Exhaustive type guard — ensures all QueryBoundBlockType values are handled above
  const validTypes: QueryBoundBlockType[] = ['product_slider', 'brand_promo', 'brand_spotlight', 'personalized_rail', 'cart_upsell_rail']
  if (!validTypes.includes(reference.blockType as QueryBoundBlockType)) {
    return null
  }

  return {
    storeId: context.storeId,
    blockId: context.blockId ?? block.id,
    blockType: reference.blockType as QueryBoundBlockType,
    querySlug,
  }
}

export function validateBlockQueryReference(
  block: HomeBlock,
  activeQuerySlugs: Iterable<string>,
  context?: { blockId?: string; blockType?: ReleaseBlockType },
): BlockQueryValidationIssue[] {
  const reference = getBlockQueryReference(block)
  if (!reference) return []

  const issues: BlockQueryValidationIssue[] = []
  const activeQuerySet = activeQuerySlugs instanceof Set ? activeQuerySlugs : new Set(activeQuerySlugs)
  const querySlug = typeof reference.querySlug === 'string' ? reference.querySlug.trim() : ''
  const label = context?.blockId ? `Block ${context.blockId}` : 'Block'

  if (reference.required && isBlank(querySlug)) {
    const requirement =
      block.type === 'personalized_rail'
        ? `${label} requires querySlug when mode is "static".`
        : `${label} requires querySlug.`

    issues.push({
      code: 'BLOCK_QUERY_REQUIRED',
      field: 'querySlug',
      message: requirement,
    })
    return issues
  }

  if (!isBlank(querySlug) && !activeQuerySet.has(querySlug)) {
    issues.push({
      code: 'BLOCK_QUERY_INACTIVE',
      field: 'querySlug',
      message: `${label} references missing/inactive query "${querySlug}".`,
    })
  }

  return issues
}

export function collectReleaseQueryUsages(input: {
  releases: ReleaseRecord[]
  blocksByReleaseId: Record<string, ReleaseBlockRecord[]>
}): QueryUsageRecord[] {
  const usages: QueryUsageRecord[] = []

  for (const release of input.releases) {
    const blocks = input.blocksByReleaseId[release.id] ?? []
    for (const block of blocks) {
      const parsed = parseHomeBlock(block.payloadJson)
      if (!parsed) continue
      const reference = getBlockQueryReference(parsed)
      const querySlug = reference?.querySlug?.trim()
      if (!reference || !querySlug) continue

      usages.push({
        querySlug,
        releaseId: release.id,
        releaseEnvironment: release.environment,
        releaseStatus: release.status,
        blockId: block.id,
        blockType: block.type,
        position: block.position,
        enabled: block.enabled !== false,
      })
    }
  }

  return usages
}

export function buildQueryUsageCountBySlug(usages: QueryUsageRecord[]): Record<string, number> {
  return usages.reduce<Record<string, number>>((counts, usage) => {
    counts[usage.querySlug] = (counts[usage.querySlug] ?? 0) + 1
    return counts
  }, {})
}

export function getQueryUsagesForSlug(usages: QueryUsageRecord[], slug: string) {
  return usages.filter((usage) => usage.querySlug === slug)
}
