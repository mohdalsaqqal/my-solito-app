'use client'

import { startTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentLocale } from '@real/app/lib/i18n/client'
import { CMSHome, Product } from '@real/app/lib/types'
import { PageLayout } from '../_components/PageLayout'
import { ShopScreen } from '@real/app/screens/ShopScreen'

type SalesPageClientProps = {
  initialProducts: Product[]
  initialCmsHome: CMSHome | null
  initialError: string | null
}

export function SalesPageClient({
  initialProducts,
  initialCmsHome,
  initialError,
}: SalesPageClientProps) {
  const router = useRouter()
  const locale = useCurrentLocale()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [loading, setLoading] = useState(!initialCmsHome)
  const [error, setError] = useState<string | null>(initialError)

  useEffect(() => {
    setProducts(initialProducts)
    setCmsHome(initialCmsHome)
    setError(initialError)
    setLoading(false)
  }, [initialProducts, initialCmsHome, initialError])

  return (
    <PageLayout
      cmsHome={cmsHome}
      products={products}
      loading={loading}
      error={error}
    >
      <ShopScreen
        products={products}
        loading={loading}
        error={error}
        bannerTitle={locale === 'ar' ? 'مختارات التخفيضات' : 'Limited Time Sales'}
        bannerSubtitle={
          locale === 'ar'
            ? 'عروض مختارة على الروتينات اليومية الأساسية.'
            : 'Selected offers across essentials and routines.'
        }
        onReload={() => {
          setLoading(true)
          setError(null)
          startTransition(() => {
            router.refresh()
          })
        }}
      />
    </PageLayout>
  )
}
