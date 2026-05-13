import { Suspense } from 'react'
import { colors, spacing } from '@real/tokens'
import { ClientHomeFeatures } from './_components/ClientHomeFeatures'
import { getHomeLayoutData } from '../server/services/home/home-layout-data.service'
import { createStorefrontServiceContext } from '../server/services/_lib/storefront-service-context'

export const revalidate = 60

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

export default async function Page({
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

  const { products, cmsHome, categories, brands, error } = await getHomeLayoutData(context)

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
        width: spacing['48'],
        height: spacing['48'],
        borderRadius: '50%',
        border: `4px solid ${colors.border}`,
        borderTop: `4px solid ${colors.brandPrimary}`,
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

