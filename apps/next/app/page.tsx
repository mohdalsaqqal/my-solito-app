import { Suspense } from 'react'
import { ClientHomeFeatures } from './_components/ClientHomeFeatures'
import { apiClient } from './apiClient'
import { CMSHome, Product } from '@real/app/lib/types'

/**
 * Homepage - Server Component
 * 
 * Fetches data on the server for:
 * - Better SEO (content in initial HTML)
 * - Faster LCP (no waterfalls)
 * - Improved performance (parallel fetches)
 * 
 * Client interactions handled by ClientHomeFeatures island.
 */

// No cache — always fresh so CMS publish changes reflect immediately
export const revalidate = 0

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ previewToken?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const previewToken = params?.previewToken

  // Parallel server-side data fetching
  const [productsResult, cmsResult, categoriesResult, brandsResult] = await Promise.allSettled([
    apiClient.products.list(),
    apiClient.cms.home(previewToken),
    apiClient.catalog.categories(),
    apiClient.catalog.brands(),
  ])

  // Handle fetch failures gracefully
  const products = productsResult.status === 'fulfilled' ? productsResult.value : []
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value : null
  
  let error: string | null = null
  if (cmsResult.status === 'rejected') {
    error = cmsResult.reason instanceof Error ? cmsResult.reason.message : 'Unable to fetch homepage data.'
  } else if (productsResult.status === 'rejected') {
    error = productsResult.reason instanceof Error ? productsResult.reason.message : 'Unable to fetch products.'
  }

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
  const brands = brandsResult.status === 'fulfilled' ? brandsResult.value : []

  return (
    <Suspense fallback={<HomePageFallback />}>
      <ClientHomeFeatures
        initialProducts={products}
        initialBrands={brands}
        initialCategories={categories}
        initialCmsHome={cmsHome}
        initialError={error}
      />
    </Suspense>
  )
}

function HomePageFallback() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #dc143c',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

