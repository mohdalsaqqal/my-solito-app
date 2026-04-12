import { categoryProvider } from '@real/providers'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import { createInternalServiceRequest } from '../_lib/public-discovery'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getCategoriesPageInitialData(previewToken?: string) {
  const baseRequest = new Request('http://internal.local/api/cms/home')
  const request = await createInternalServiceRequest('/api/cms/home', baseRequest, previewToken ? { previewToken } : undefined)

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
