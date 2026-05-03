import { Suspense } from 'react'
import { getSearchPageInitialData } from '../../server/services/search/search.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'
import { SearchPageClient } from './SearchPageClient'

async function SearchPageContent({ query }: { query: string }) {
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

function SearchPageSkeleton() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ height: 32, width: 280, backgroundColor: '#e5e5e5', borderRadius: 8, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ aspectRatio: '1', backgroundColor: '#e5e5e5', borderRadius: 12 }} />
            <div style={{ height: 16, width: '80%', backgroundColor: '#e5e5e5', borderRadius: 4 }} />
            <div style={{ height: 16, width: '50%', backgroundColor: '#e5e5e5', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = (params.q ?? '').trim()

  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent query={query} />
    </Suspense>
  )
}
