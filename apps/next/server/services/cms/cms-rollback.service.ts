/**
 * CMS Rollback — revert to a prior published release.
 *
 * Finds a prior published release for the same environment and re-publishes it,
 * effectively rolling back the current published release.
 */
import { revalidateTag } from 'next/cache'
import { releaseProvider } from '@real/providers'
import { createPageVersionSnapshot } from '../../../app/api/_lib/page-version-store'

export interface RollbackResult {
  ok: boolean
  error?: string
  rolledBackToReleaseId?: string
  pageVersionId?: string
  environment?: 'staging' | 'production'
}

export async function rollbackRelease(
  targetReleaseId: string,
  options: { storeId?: string } = {},
): Promise<RollbackResult> {
  const normalizedReleaseId = targetReleaseId.trim()
  if (!normalizedReleaseId) {
    return { ok: false, error: 'RELEASE_ID_REQUIRED' }
  }

  // 1. Fetch the target release
  const getResult = await releaseProvider.getById(normalizedReleaseId)
  if (!getResult.ok) {
    return { ok: false, error: 'TARGET_RELEASE_NOT_FOUND' }
  }
  const targetRelease = getResult.data

  // 2. Publish the target release (this unpublishes the current one)
  const publishResult = await releaseProvider.publish(normalizedReleaseId)
  if (!publishResult.ok) {
    return { ok: false, error: publishResult.error?.message ?? 'ROLLBACK_FAILED' }
  }

  // 3. Snapshot page version for the rolled-back release
  let pageVersionId: string | undefined
  const blocksResult = await releaseProvider.listBlocks(normalizedReleaseId)
  if (blocksResult.ok && blocksResult.data.length > 0) {
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
    rolledBackToReleaseId: normalizedReleaseId,
    pageVersionId,
    environment: targetRelease.environment,
  }
}
