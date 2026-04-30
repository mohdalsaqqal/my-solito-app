import React, { useMemo } from 'react'
import { Product, CMSHome } from '@real/app/lib/types'
import {
  HomeCategoryStrip,
  HomeHeroRail,
  HomeProductRail,
  RevealOnScroll,
} from '@real/ui/components'
import { PageScaffold, Section } from '@real/ui'
import { motionDuration } from '@real/tokens'
import { NavItem } from '@real/app/features/shell'
import { applyProductFilter } from '@real/app/lib/product-filter'
import { buildProductCardModels } from '@real/app/lib/product-card-model'

type LegacyHomeScreenProps = {
  products: Product[]
  cmsHome?: CMSHome | null
  categories: NavItem[]
  loading: boolean
  error: string | null
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

export const LegacyHomeScreen = React.memo(function LegacyHomeScreen({
  products,
  cmsHome,
  categories,
  loading,
  error,
  onReload,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: LegacyHomeScreenProps) {
  const heroItems = useMemo(() => {
    const cmsCards = cmsHome?.marketing?.hero?.cards ?? []
    if (cmsCards.length > 0) {
      return cmsCards.map((card) => ({
        ...card,
        badgeLabel: typeof card.badgeLabel === 'string' ? card.badgeLabel : undefined,
      }))
    }
    return cmsHome?.heroSlides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      ctaLabel: slide.ctaLabel,
      href: '/shop',
    })) ?? []
  }, [cmsHome])

  const flashSaleProducts = useMemo(
    () => buildProductCardModels(applyProductFilter(products, { onSale: true, limit: 8 })),
    [products]
  )
  const bestSellerProducts = useMemo(
    () => buildProductCardModels(applyProductFilter(products, { sort: 'bestseller', limit: 8 })),
    [products]
  )
  const categoryItems = useMemo(
    () =>
      categories.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
      })),
    [categories]
  )

  function openHref(href?: string) {
    if (!href) {
      return
    }
    onNavigate?.(href)
  }

  return (
    <PageScaffold variant='editorial' density='roomy' scroll='auto'>
      <PageScaffold.Body>
        <Section bleed='full' y='roomy'>
          <RevealOnScroll delayMs={0}>
            <HomeHeroRail
              items={heroItems}
              autoplay={cmsHome?.marketing?.hero?.autoplay ?? true}
              autoplayMs={cmsHome?.marketing?.hero?.autoplayMs ?? 3200}
              onPressItem={openHref}
            />
          </RevealOnScroll>
        </Section>

        <Section y='standard'>
          <RevealOnScroll delayMs={motionDuration.stagger}>
            <HomeProductRail
              title='Flash Sale'
              items={flashSaleProducts}
              loading={loading}
              error={error}
              onRetry={onReload}
              onPressViewAll={() => openHref('/sales')}
              onPressProduct={(item) => onSelectProduct?.(item.id)}
              onAddToCart={(item) => onAddToCart?.(item.id)}
            />
          </RevealOnScroll>
        </Section>

        <Section y='tight'>
          <RevealOnScroll delayMs={motionDuration.stagger * 2}>
            <HomeCategoryStrip
              items={categoryItems}
              onPressItem={(item) => openHref(item.href)}
            />
          </RevealOnScroll>
        </Section>

        <Section y='standard'>
          <RevealOnScroll delayMs={motionDuration.stagger * 3}>
            <HomeProductRail
              title='Trending Best Sellers'
              items={bestSellerProducts}
              loading={loading}
              error={error}
              onRetry={onReload}
              onPressViewAll={() => openHref('/shop')}
              onPressProduct={(item) => onSelectProduct?.(item.id)}
              onAddToCart={(item) => onAddToCart?.(item.id)}
            />
          </RevealOnScroll>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
