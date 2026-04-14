/**
 * CMS Publish — publish a draft release and snapshot page version.
 *
 * Publishes a release, sets it as the canonical published version for its
 * environment, and snapshots the release blocks as a page version record.
 */
import { revalidateTag } from 'next/cache'
import { productQueryProvider, releaseProvider } from '@real/providers'
import type { AdminReleaseRecord } from '@real/app/lib/types'
import { validateReleasePublishReadiness } from '@real/app/lib/cms/release-publish-readiness'
import { createPageVersionSnapshot } from '../../../app/api/_lib/page-version-store'

export interface PublishResult {
  ok: boolean
  error?: string
  releaseId?: string
  pageVersionId?: string
  environment?: 'staging' | 'production'
  release?: AdminReleaseRecord
}

export async function publishRelease(
  releaseId: string,
  options: { storeId?: string } = {},
): Promise<PublishResult> {
  const normalizedReleaseId = releaseId.trim()
  if (!normalizedReleaseId) {
    return { ok: false, error: 'RELEASE_ID_REQUIRED' }
  }

  // 1. Fetch the release
  const getResult = await releaseProvider.getById(normalizedReleaseId)
  if (!getResult.ok) {
    return { ok: false, error: 'RELEASE_NOT_FOUND' }
  }
  const release = getResult.data

  if (release.status === 'published') {
    return { ok: false, error: 'ALREADY_PUBLISHED' }
  }

  // 2. Validate publish readiness before mutating release state.
  const [blocksResult, queriesResult] = await Promise.all([
    releaseProvider.listBlocks(normalizedReleaseId),
    productQueryProvider.list(),
  ])

  if (!blocksResult.ok) {
    return { ok: false, error: blocksResult.error?.message ?? 'RELEASE_BLOCKS_UNAVAILABLE' }
  }

  if (!queriesResult.ok) {
    return { ok: false, error: queriesResult.error?.message ?? 'PRODUCT_QUERIES_UNAVAILABLE' }
  }

  const readiness = validateReleasePublishReadiness({
    blocks: blocksResult.data,
    activeQuerySlugs: queriesResult.data.filter((query) => query.active).map((query) => query.slug),
  })

  if (!readiness.ok) {
    return { ok: false, error: readiness.issues[0]?.message ?? 'PUBLISH_READINESS_FAILED' }
  }

  // 3. Publish the release
  const publishResult = await releaseProvider.publish(normalizedReleaseId)
  if (!publishResult.ok) {
    return { ok: false, error: publishResult.error?.message ?? 'PUBLISH_FAILED' }
  }

  // 4. Snapshot page version and invalidate cached home payloads.
  let pageVersionId: string | undefined
  if (blocksResult.data.length > 0) {
    const pageVersion = await createPageVersionSnapshot({
      releaseId: normalizedReleaseId,
      storeId: options.storeId ?? 'default',
      source: 'publish',
      blocks: blocksResult.data,
    })
    pageVersionId = pageVersion.id
  }

  revalidateTag('cms-home', 'max')

  return {
    ok: true,
    releaseId: normalizedReleaseId,
    pageVersionId,
    environment: publishResult.data.environment,
    release: publishResult.data as AdminReleaseRecord,
  }
}
