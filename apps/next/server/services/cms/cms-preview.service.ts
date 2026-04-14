/**
 * CMS Preview — draft content resolution service.
 *
 * Resolves preview tokens to release/block data for preview mode.
 * When no valid preview token exists, returns null so the caller falls
 * back to the published release.
 */
import { releaseProvider } from '@real/providers'
import { verifyPreviewToken } from '../../../app/api/_lib/preview-token'
import { getPageVersionById, findLatestPageVersionByRelease, toReleaseBlockRecords } from '../../../app/api/_lib/page-version-store'

export interface PreviewContext {
  valid: boolean
  releaseId: string | null
  versionId: string | null
}

export interface PreviewRelease {
  id: string
  name?: string
  environment: 'staging' | 'production'
  status: 'draft' | 'published'
}

/**
 * Resolves the preview context from a request URL.
 */
export function resolvePreviewContext(requestUrl: string): PreviewContext {
  const url = new URL(requestUrl)
  const previewToken = url.searchParams.get('previewToken')
  const result = verifyPreviewToken(previewToken)
  return {
    valid: result.valid,
    releaseId: result.releaseId ?? null,
    versionId: result.versionId ?? null,
  }
}

/**
 * Fetches the preview release record when a valid preview token exists.
 */
export async function getPreviewRelease(context: PreviewContext): Promise<PreviewRelease | null> {
  if (!context.valid || !context.releaseId) return null
  const result = await releaseProvider.getById(context.releaseId)
  if (!result.ok) return null
  return result.data as PreviewRelease
}

/**
 * Loads preview blocks for a given release. Falls back to page-version store.
 */
export async function loadPreviewBlocks(context: PreviewContext, storeId: string) {
  if (!context.valid || !context.releaseId) return null

  // If the preview token points to an explicit version, honor it exactly.
  if (context.versionId) {
    const version = await getPageVersionById(context.versionId)
    if (version) return toReleaseBlockRecords(version)
  }

  // Otherwise resolve the latest stored snapshot for the release.
  const latestVersion = await findLatestPageVersionByRelease({
    releaseId: context.releaseId,
    storeId,
  })
  if (latestVersion) return toReleaseBlockRecords(latestVersion)

  // Fall back to release provider blocks
  const blocksResult = await releaseProvider.listBlocks(context.releaseId)
  if (!blocksResult.ok) return null
  return blocksResult.data
}
