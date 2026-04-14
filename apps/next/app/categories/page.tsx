import { CategoriesPageClient } from './CategoriesPageClient'
import { getCategoriesPageInitialData } from '../../server/services/categories/categories-page.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ previewToken?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const previewToken = params?.previewToken
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
    previewToken,
  })
  const { cmsHome, categoryTree, error } = await getCategoriesPageInitialData(context)

  return (
    <CategoriesPageClient
      initialCmsHome={cmsHome}
      initialCategoryTree={categoryTree}
      initialError={error}
    />
  )
}
