import { productQueryProvider, releaseProvider } from '@real/providers'
import type { ProductFilter, ReleaseBlockRecord } from '@real/providers/contracts'
import { buildQueryUsageCountBySlug, collectReleaseQueryUsages, getQueryUsagesForSlug } from '@real/app/lib/cms/query-references'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../app/api/_lib/admin-controls-store'
import { ServiceError } from '../_lib/service-error'

type QueryTitle = {
  en?: string
  ar?: string
}

type CreatePayload = {
  slug?: string
  active?: boolean
  title?: QueryTitle
  filters?: ProductFilter
}

type PatchPayload = {
  active?: boolean
  title?: QueryTitle
  filters?: ProductFilter
}

async function loadAllQueryUsages() {
  const releasesResult = await releaseProvider.list()
  if (!releasesResult.ok) {
    throw new ServiceError(releasesResult.error.code, releasesResult.error.message, 500)
  }

  const blocksByReleaseId: Record<string, ReleaseBlockRecord[]> = {}
  for (const release of releasesResult.data) {
    const blocks = await releaseProvider.listBlocks(release.id)
    if (!blocks.ok) {
      throw new ServiceError(blocks.error.code, blocks.error.message, 500)
    }
    blocksByReleaseId[release.id] = blocks.data
  }

  return collectReleaseQueryUsages({
    releases: releasesResult.data,
    blocksByReleaseId,
  })
}

function normalizeTitle(title: QueryTitle | undefined, fallback: string) {
  return {
    en: title?.en?.trim() || fallback,
    ar: title?.ar?.trim() || fallback,
  }
}

export async function listAdminProductQueries() {
  const [result, usages] = await Promise.all([
    productQueryProvider.list(),
    loadAllQueryUsages(),
  ])

  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 500)
  }

  const usageCountBySlug = buildQueryUsageCountBySlug(usages)

  return result.data.map((query) => ({
    ...query,
    usageCount: usageCountBySlug[query.slug] ?? 0,
  }))
}

export async function createAdminProductQuery(
  payload: CreatePayload,
  actor: { userId: string; email: string },
) {
  const slug = (payload.slug ?? '').trim().toLowerCase()
  if (!slug) {
    throw new ServiceError('ADMIN_PRODUCT_QUERY_SLUG_REQUIRED', 'slug is required.', 400)
  }

  const created = await productQueryProvider.create({
    slug,
    active: payload.active ?? true,
    title: normalizeTitle(payload.title, slug),
    filters: payload.filters ?? {},
  })
  if (!created.ok) {
    throw new ServiceError(
      created.error.code,
      created.error.message,
      created.error.code === 'PRODUCT_QUERY_EXISTS' ? 409 : 400,
    )
  }

  const state = await readAdminControlsState()
  pushAudit(state, {
    type: 'marketing',
    targetId: slug,
    actor,
    changes: { action: 'query.create' },
  })
  await writeAdminControlsState(state)

  return created.data
}

export async function getAdminProductQuery(slug: string) {
  const [queryResult, usages] = await Promise.all([
    productQueryProvider.getBySlug(slug),
    loadAllQueryUsages(),
  ])

  if (!queryResult.ok) {
    throw new ServiceError(
      queryResult.error.code,
      queryResult.error.message,
      queryResult.error.code === 'PRODUCT_QUERY_NOT_FOUND' ? 404 : 400,
    )
  }

  const usedBy = getQueryUsagesForSlug(usages, slug)

  return {
    ...queryResult.data,
    usedBy,
    usageCount: usedBy.length,
  }
}

export async function updateAdminProductQuery(
  slug: string,
  payload: PatchPayload,
  actor: { userId: string; email: string },
) {
  const updated = await productQueryProvider.update(slug, {
    active: typeof payload.active === 'boolean' ? payload.active : undefined,
    title:
      payload.title?.en || payload.title?.ar
        ? {
            en: payload.title?.en?.trim() || '',
            ar: payload.title?.ar?.trim() || '',
          }
        : undefined,
    filters: payload.filters,
  })
  if (!updated.ok) {
    throw new ServiceError(
      updated.error.code,
      updated.error.message,
      updated.error.code === 'PRODUCT_QUERY_NOT_FOUND' ? 404 : 400,
    )
  }

  const state = await readAdminControlsState()
  pushAudit(state, {
    type: 'marketing',
    targetId: slug,
    actor,
    changes: { action: 'query.update' },
  })
  await writeAdminControlsState(state)

  return updated.data
}

export async function deleteAdminProductQuery(
  slug: string,
  actor: { userId: string; email: string },
) {
  const usages = getQueryUsagesForSlug(await loadAllQueryUsages(), slug)
  if (usages.length > 0) {
    throw new ServiceError(
      'ADMIN_PRODUCT_QUERY_IN_USE',
      `Query "${slug}" is still referenced by ${usages.length} block(s). Remove those references first.`,
      409,
    )
  }

  const deleted = await productQueryProvider.delete(slug)
  if (!deleted.ok) {
    throw new ServiceError(
      deleted.error.code,
      deleted.error.message,
      deleted.error.code === 'PRODUCT_QUERY_NOT_FOUND' ? 404 : 400,
    )
  }

  const state = await readAdminControlsState()
  pushAudit(state, {
    type: 'marketing',
    targetId: slug,
    actor,
    changes: { action: 'query.delete' },
  })
  await writeAdminControlsState(state)

  return deleted.data
}

