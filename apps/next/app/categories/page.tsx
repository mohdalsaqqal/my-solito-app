import { CategoriesPageClient } from './CategoriesPageClient'
import { getCategoriesPageInitialData } from '../../server/services/categories/categories-page.service'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ previewToken?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const previewToken = params?.previewToken
  const { cmsHome, categoryTree, error } = await getCategoriesPageInitialData(previewToken)

  return (
    <CategoriesPageClient
      initialCmsHome={cmsHome}
      initialCategoryTree={categoryTree}
      initialError={error}
    />
  )
}
