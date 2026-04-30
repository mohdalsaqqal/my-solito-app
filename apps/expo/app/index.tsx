import { useMemo, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { spacing } from '@real/tokens'
import { Box, Drawer, Text } from '@real/ui'
import { Button } from '@real/ui/components'
import {
  Layout,
  defaultBottomNavItems,
  defaultBrandItems,
  defaultFooterLinks,
  defaultSalesItems,
  defaultSocialLinks,
} from '@real/app/features/shell'
import { resolveDirection, syncNativeRtlDirection } from '@real/app/lib/rtl-manager'
import { useAppBootstrap } from './_hooks/useAppBootstrap'
import { useStorefrontData } from './_hooks/useStorefrontData'
import { useAccountData } from './_hooks/useAccountData'
import { useSearchData } from './_hooks/useSearchData'
import { AppRouter } from './_components/AppRouter'
import type { ExpoView } from './_components/AppRouter.types'
import { apiClient } from './apiClient'

const REQUIRE_AUTH_FOR_CHECKOUT = false

syncNativeRtlDirection('en')

export default function HomeRoute() {
  const insets = useSafeAreaInsets()
  const { fontsLoaded, locale, onLocaleChange } = useAppBootstrap()

  const [view, setView] = useState<ExpoView>('home')
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null)
  const [activeBrandSlug, setActiveBrandSlug] = useState<string | null>(null)

  const storefront = useStorefrontData(locale)

  const account = useAccountData(
    storefront.session,
    storefront.setSession,
    storefront.setCart,
    () => setView('home'),
  )

  const search = useSearchData()

  const dir = resolveDirection(locale)

  const activeBottomNavId =
    view === 'home'
      ? 'home'
      : view === 'categories' || view === 'product' || view === 'shop'
        ? 'categories'
        : view === 'checkout' || view === 'cart'
          ? 'cart'
          : view === 'account'
            ? 'account'
            : 'more'

  const checkoutConfig = useMemo(() => ({
    paymentMethods: {
      codEnabled: storefront.cmsHome?.identity?.customer?.checkout?.paymentMethods?.codEnabled,
      cardOnDeliveryEnabled:
        storefront.cmsHome?.identity?.customer?.checkout?.paymentMethods?.cardOnDeliveryEnabled,
      onlineCardEnabled:
        storefront.cmsHome?.identity?.customer?.checkout?.paymentMethods?.onlineCardEnabled,
    },
    fulfillment: {
      deliveryEnabled:
        storefront.cmsHome?.identity?.customer?.checkout?.fulfillment?.deliveryEnabled,
      branchPickupEnabled:
        storefront.cmsHome?.identity?.customer?.checkout?.fulfillment?.branchPickupEnabled,
    },
    branches: (storefront.cmsHome?.identity?.customer?.checkout?.branches ?? []).map((branch) => ({
      id: branch.id,
      name: branch.name[locale],
      city: branch.city?.[locale],
      area: branch.area?.[locale],
      building: branch.building?.[locale],
      stockCount: branch.stockCount ?? 0,
      distanceKm: branch.distanceKm,
      payAtBranchEnabled: branch.payAtBranchEnabled,
      payNowEnabled: branch.payNowEnabled,
    })),
  }), [storefront.cmsHome, locale])

  if (!fontsLoaded) return null

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <Layout
        shellContent={storefront.cmsHome?.shell ?? undefined}
        branding={{
          logoSrc:
            storefront.cmsHome?.shell?.branding?.logo.uri ??
            'https://dummyimage.com/260x60/ffffff/16181c.png&text=REAL+COSMETICS',
          logoAlt: 'Real Cosmetics',
        }}
        campaign={{
          text:
            storefront.cmsHome?.shell?.topBar?.message?.[locale] ??
            'Free delivery for orders above 99 USD',
        }}
        cart={{
          count: storefront.cartCount,
          items: storefront.cartLines,
          subtotal: storefront.cartSubtotal,
          onViewCart: () => {
            if (REQUIRE_AUTH_FOR_CHECKOUT && !storefront.session) { setView('auth-login'); return }
            setView('cart')
          },
          onCheckout: () => {
            if (REQUIRE_AUTH_FOR_CHECKOUT && !storefront.session) { setView('auth-login'); return }
            setView('checkout')
          },
          onMobileCartNavigate: () => {
            if (REQUIRE_AUTH_FOR_CHECKOUT && !storefront.session) { setView('auth-login'); return }
            setView('cart')
          },
        }}
        wishlistCount={2}
        accountCount={storefront.session ? 1 : 0}
        navigation={{
          categories: storefront.shellCategories,
          salesItems: defaultSalesItems,
          brandItems: defaultBrandItems,
          footerLinks: defaultFooterLinks,
          socialLinks: defaultSocialLinks,
          bottomNavItems: defaultBottomNavItems,
          activeBottomNavId,
          onBottomNavChange: (item) => {
            if (item.id === 'home') setView('home')
            if (item.id === 'categories') {
              setActiveCategorySlug(null)
              setActiveBrandSlug(null)
              setView('categories')
            }
            if (item.id === 'cart') {
              if (REQUIRE_AUTH_FOR_CHECKOUT && !storefront.session) {
                setView('auth-login')
              } else {
                setView('cart')
              }
            }
            if (item.id === 'deals') setView('deals')
            if (item.id === 'account') setView(storefront.session ? 'account' : 'auth-login')
            if (item.id === 'more') setMoreOpen(true)
          },
        }}
        newsletter={{
          title:
            storefront.cmsHome?.shell?.footer?.newsletterTitle?.[locale] ?? 'Stay in the loop',
          subtitle:
            storefront.cmsHome?.shell?.footer?.newsletterSubtitle?.[locale] ??
            'Get launches, offers, and skincare insights.',
        }}
        locale={{
          code: locale,
          onChange: onLocaleChange,
        }}
        actions={{
          onSearchSubmit: (query) => {
            search.submitSearch(query)
            setView('search')
          },
          onNativeCategoriesPress: () => {
            setActiveCategorySlug(null)
            setActiveBrandSlug(null)
            setView('categories')
          },
          onNativeAccountPress: () => {
            setView(storefront.session ? 'account' : 'auth-login')
          },
        }}
        display={{
          showFooter: false,
          mobileBottomInset: insets.bottom,
        }}
      >
        <AppRouter
          view={view}
          setView={setView}
          locale={locale}
          // Storefront
          {...storefront}
          // Account
          {...account}
          // Search
          activeSearchQuery={search.activeSearchQuery}
          searchSuggestions={search.searchSuggestions}
          searchLoading={search.searchLoading}
          searchError={search.searchError}
          // Navigation
          activeProductId={activeProductId}
          setActiveProductId={setActiveProductId}
          activeCategorySlug={activeCategorySlug}
          setActiveCategorySlug={setActiveCategorySlug}
          activeBrandSlug={activeBrandSlug}
          setActiveBrandSlug={setActiveBrandSlug}
          // Checkout config passed via AppRouter for checkout screen
          checkoutConfig={checkoutConfig}
        />
      </Layout>

      <Drawer open={moreOpen} onClose={() => setMoreOpen(false)}>
        <Box style={{ gap: spacing.md }}>
          <Text variant='headline'>{locale === 'ar' ? 'المزيد' : 'More'}</Text>
          <Button variant='ghost' onPress={() => { setMoreOpen(false); setView('deals') }}>
            {locale === 'ar' ? 'العروض' : 'Deals'}
          </Button>
          <Button
            variant='ghost'
            onPress={() => {
              setMoreOpen(false)
              if (!storefront.session) { setView('auth-login'); return }
              if (account.orders.length === 0 && !account.ordersLoading) void account.loadOrders()
              setView('orders')
            }}
          >
            {locale === 'ar' ? 'الطلبات' : 'Orders'}
          </Button>
          <Button
            variant='ghost'
            onPress={() => {
              setMoreOpen(false)
              setView(storefront.session ? 'account' : 'auth-login')
            }}
          >
            {locale === 'ar' ? 'الحساب' : 'Account'}
          </Button>
          <Button
            variant='ghost'
            onPress={async () => {
              setMoreOpen(false)
              if (storefront.session) {
                await account.signOut()
                return
              }
              setView('auth-login')
            }}
          >
            {storefront.session
              ? locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'
              : locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
          </Button>
        </Box>
      </Drawer>
    </SafeAreaView>
  )
}
