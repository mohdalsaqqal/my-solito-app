import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AuthSession,
  Cart,
  CMSHome,
  Product,
} from '@real/app/lib/types'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { apiClient } from '../apiClient'
import type { AppLocale } from './useAppBootstrap'
import {
  defaultCategories as defaultShellCategories,
} from '@real/app/features/shell'

type Brand = {
  id: string
  slug: string
  name: { en: string; ar: string }
  logo?: string
  description?: { en: string; ar: string }
  isActive: boolean
}

type Category = {
  id: string
  slug: string
  name: { en: string; ar: string }
  parentId?: string
  image?: string
  isActive: boolean
  sortOrder: number
}

type CategoryTreeNode = Category & {
  children: CategoryTreeNode[]
}

export function useStorefrontData(locale: AppLocale) {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResult, cartResult, cmsResult, categoriesResult, categoryTreeResult, brandsResult, sessionResult] =
        await Promise.allSettled([
          apiClient.products.list(),
          apiClient.cart.get(),
          apiClient.cms.home(),
          apiClient.catalog.categories(),
          apiClient.catalog.categoryTree(),
          apiClient.catalog.brands(),
          apiClient.auth.session().catch(() => null),
        ])

      if (productsResult.status === 'fulfilled') setProducts(productsResult.value)
      if (cartResult.status === 'fulfilled') setCart(cartResult.value)
      if (cmsResult.status === 'fulfilled') setCmsHome(cmsResult.value)
      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value)
      if (categoryTreeResult.status === 'fulfilled') setCategoryTree(categoryTreeResult.value as CategoryTreeNode[])
      if (brandsResult.status === 'fulfilled') setBrands(brandsResult.value)

      const nextSession =
        sessionResult.status === 'fulfilled' ? sessionResult.value : null
      setSession(nextSession)

      const criticalFailure = [productsResult, cmsResult].find(
        (result) => result.status === 'rejected',
      )
      if (criticalFailure && criticalFailure.status === 'rejected') {
        const reason = criticalFailure.reason
        setError(reason instanceof Error ? reason.message : 'Unable to fetch homepage data.')
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const cartLines = useMemo(
    () =>
      (cart?.items ?? [])
        .map((line) => {
          const product = products.find((item) => item.id === line.productId)
          if (!product) return null
          const resolvedPrice = passThroughPricingService.getProductPrice(product, {
            quantity: line.quantity,
          })
          return {
            id: line.productId,
            name: product.name,
            quantity: line.quantity,
            price: resolvedPrice.unitPrice,
            currency: product.currency,
          }
        })
        .filter(
          (
            line,
          ): line is { id: string; name: string; quantity: number; price: number; currency: string } =>
            Boolean(line),
        ),
    [cart, products],
  )

  const cartCount = useMemo(
    () => (cart?.items ?? []).reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  )

  const cartSubtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cartLines],
  )

  const checkoutItems = useMemo(
    () =>
      (cart?.items ?? []).flatMap((line) => {
        const product = products.find((item) => item.id === line.productId)
        if (!product) return []
        const resolvedPrice = passThroughPricingService.getProductPrice(product, {
          quantity: line.quantity,
        })
        return [
          {
            id: product.id,
            name: product.name,
            quantity: line.quantity,
            price: resolvedPrice.unitPrice,
            currency: product.currency,
            imageUrl: product.image,
          },
        ]
      }),
    [cart, products],
  )

  const shellCategories = useMemo(() => {
    if (categories.length === 0) return defaultShellCategories
    return categories
      .filter((category) => category.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        id: category.id,
        label: category.name[locale],
        href: `/shop?categories=${encodeURIComponent(category.slug)}`,
      }))
  }, [categories, locale])

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const nextCart = await apiClient.cart.add(productId, quantity)
    setCart(nextCart)
  }, [])

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    const nextCart = await apiClient.cart.setQuantity(productId, quantity)
    setCart(nextCart)
  }, [])

  const removeFromCart = useCallback(async (productId: string) => {
    const nextCart = await apiClient.cart.remove(productId)
    setCart(nextCart)
  }, [])

  return {
    products,
    brands,
    categories,
    categoryTree,
    cart,
    setCart,
    cmsHome,
    session,
    setSession,
    loading,
    error,
    loadProducts,
    cartLines,
    cartCount,
    cartSubtotal,
    checkoutItems,
    shellCategories,
    addToCart,
    updateCartQuantity,
    removeFromCart,
  }
}
