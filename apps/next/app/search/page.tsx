import { getSearchPageInitialData } from '../../server/services/search/search.service'
import { SearchPageClient } from './SearchPageClient'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = (params.q ?? '').trim()
  const { products, cmsHome, searchResult, error } = await getSearchPageInitialData(query)

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
