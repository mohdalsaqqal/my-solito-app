import { categoryProvider } from '@real/providers'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getCategoriesPageInitialData(
  context: Pick<StorefrontServiceContext, 'requestUrl'>,
) {
  const request = new Request(context.requestUrl)
  const [cmsResult, treeResult] = await Promise.allSettled([
    getHomeCmsResponseData(request),
    categoryProvider.tree(),
  ])

  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null
  const categoryTree =
    treeResult.status === 'fulfilled' && treeResult.value.ok ? treeResult.value.data : []

  let error: string | null = null
  if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to fetch category page data.')
  } else if (treeResult.status === 'rejected') {
    error = toErrorMessage(treeResult.reason, 'Unable to fetch categories.')
  } else if (treeResult.status === 'fulfilled' && !treeResult.value.ok) {
    error = treeResult.value.error.message
  }

  return {
    cmsHome,
    categoryTree,
    error,
  }
}
