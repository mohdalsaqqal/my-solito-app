import { getSearchPageInitialData } from '../../server/services/search/search.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'
import { SearchPageClient } from './SearchPageClient'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = (params.q ?? '').trim()
  const context = await createStorefrontServiceContext({
    pathname: '/api/search',
    searchParams: query ? { q: query } : undefined,
  })
  const { products, cmsHome, searchResult, error } = await getSearchPageInitialData(query, context)

  return (
    <SearchPageClient
      query={query}
      initialProducts={products}
      initialCmsHome={cmsHome}
      initialSearchResult={searchResult}
      initialError={error}
    />
  )
}
